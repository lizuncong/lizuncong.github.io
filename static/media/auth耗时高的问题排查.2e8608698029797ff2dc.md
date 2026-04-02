## 问题
大部分的接口，实时性不高，可以充分利用缓存，没必要每次都调用GO接口获取，下面是不走缓存的时候，接口耗时情况：

![image](./images/nocache.png)

优化后，`fetchWithCache`方法都默认加上了缓存，缓存60秒，调用GO服务的相同接口请求，如果走缓存的话，耗时在0-1毫秒左右。不会超过2毫秒，如下图所示，缓存生效，耗时几毫秒。

![image](./images/cache.png)

但是，在fetchWithCache方法中，如果调用了`next-auth`提供的`await auth()`方法，会导致接口耗时整体延长，如下图所示：

![image](./images/auth.png)

接口缓存是生效的，这里是因为auth的执行太耗时了导致整体耗时增加

## 问题排查

中间省去N个排查过程，下面是调用auth时，里面的几个关键操作的分析

###  index.js

路径：`node_modules\.pnpm\@auth+core@0.37.2\node_modules\@auth\core\lib\index.js`

主要是两个函数的耗时较高：

```js
const { options, cookies } = await init({
  authOptions,
  action,
  providerId,
  url: request.url,
  callbackUrl: request.body?.callbackUrl ?? request.query?.callbackUrl,
  csrfToken: request.body?.csrfToken,
  cookies: request.cookies,
  isPost: method === 'POST',
  csrfDisabled,
});
```

以及

```js
const seRes = await actions.session(options, sessionStore, cookies);
```

> 当我们调用auth时，auth执行的耗时等于 `init 方法的耗时` + `actions.session的耗时`

### init方法

路径：`node_modules\.pnpm\@auth+core@0.37.2\node_modules\@auth\core\lib\init.js`

主要是
node_modules\.pnpm\@auth+core@0.37.2\node_modules\@auth\core\src\lib\actions\callback\oauth\csrf-token.ts

![image](./images/csrf.png)

```js
const { csrfToken, cookie: csrfCookie, csrfTokenVerified, } = await createCSRFToken({
  options,
  cookieValue: reqCookies?.[options.cookies.csrfToken.name],
  isPost,
  bodyValue: reqCsrfToken,
});
```
createCSRFToken内部调用了createHash：

```js
export async function createHash(message: string) {
  const data = new TextEncoder().encode(message)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toString()
}
```

`crypto.subtle.digest`是CPU密集型操作，可以通过下面的demo验证：

![image](./images/hash.png)

**可以发现，当并发量上来时，createHash回调的时间就越来越长**

### session

主要调用了`jwt.decode`，`jwt.encode`两个方法，实现在`node_modules\.pnpm\@auth+core@0.37.2\node_modules\@auth\core\jwt.js`

![image](./images/session.png)

`jwt.js`源码如下，可以直接用这个源码测试：

```js
import { hkdf } from '@panva/hkdf';
import { base64url, calculateJwkThumbprint, EncryptJWT, jwtDecrypt } from 'jose';

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const now = () => (Date.now() / 1000) | 0;
const alg = 'dir';
const enc = 'A256CBC-HS512';
/** Issues a JWT. By default, the JWT is encrypted using "A256CBC-HS512". */
const params = {
  secret: '8b5c5f7b6611219c61beb8f08b9fd108',
  maxAge: 1296000,
  token: {
    sub: '21a284a6-9566-4dd8-aa0e-fa1ae2b1b168',
    user: {
      uid: 1659514635781,
      cookieValue: '_uid_=1a7c2ab3-2fd5-4c96-9672-310dafa6dd93; _ga=GA1.1.1940450995.1775033135; __Secure-authjs.callback-url=https://haven.test.huya.info; __Host-authjs.csrf-token=52c364376ab05de88bc6956f41222b648377fb8dccc955197c3ee2639593b549|6c9da61835b2cc2f9d0c8dbc85ff85cc47a5e0f0a28b9c53f3327e99d2dbd72b; udb_deviceid=w_1091765325197586432; _ga_YBXG8W3LWR-test=GS2.1.s1775033135$o1$g0$t1775033138$j57$l0$h0; udb_uid=1659514635781; yyuid=1659514635781; udb_version=1.0; udb_biztoken=AQIJu9QHBa7NOluPoYGvVEHsC-wSIa070YxQj7TVNkacJJYPZV2ySwjikC2hzoS6eo6-xeXEk2INjjuaPzi66a_ekbhzYBAQ_D3dg0Y-vPd3PPtZdHFfJVxxvDuCDVxpPVnXDz5bSNgDnQDSuoHWzGGSNWDs3vo4M0G4-jS8pdr2n0-fxcGEOGswST9eP5V_ygEWLm1Oe2LPl4NFkhZfw0Q_0bQ8Es6GVVbjetMm4ISsMWTjXzWNRUpqHEM8rHB-iLs75zJPLNldcti9P8v42lx6MDHC8Xp3ohrRwdzs9QgKVprzZNoTgONiwdRyUa95p2xyW3GUL3Ox0dCktDHdYriC; udb_origin=30; udb_status=0; udb_cred=ChPyLm2EFZ0N0UZOOcP-Ur5EIjRJVURch851LDKK-AqPVGPjC3iKYWdapHSDLvz-69xNIedddDteBmr_PAozHeT_p56YlbR0AC_1milFklt__5MgzbWuU2J5jteoYhfznmaZT5xABJY4isO7BGgudw72; nickname=lzc_680; avatar=https://tr.rbxcdn.com/30DAY-AvatarHeadshot-F05BB073E2A6AB604F0C5F7645157074-Png/150/150/AvatarHeadshot/Png/noFilter; udb_openid=8940221641; partner_uid=8940221641; udb_other={"lt":"1775033146507","isRem":"1"}',
      id: '21a284a6-9566-4dd8-aa0e-fa1ae2b1b168',
    },
    iat: 1775118169,
    exp: 1776414169,
    jti: 'edaf7242-82ec-462f-ae9d-5adbf94790d1',
  },
  salt: '__Secure-authjs.session-token',
};
export async function encode(params, count) {
  const { token = {}, secret, maxAge = DEFAULT_MAX_AGE, salt } = params;
  const startTime = Date.now();
  const secrets = Array.isArray(secret) ? secret : [secret];
  const encryptionSecret = await getDerivedEncryptionKey(enc, secrets[0], salt);
  const spend2 = Date.now();
  const thumbprint = await calculateJwkThumbprint({ kty: 'oct', k: base64url.encode(encryptionSecret) }, `sha${encryptionSecret.byteLength << 3}`);
  const spend3 = Date.now();
  // @ts-expect-error `jose` allows any object as payload.
  const res = await new EncryptJWT(token)
    .setProtectedHeader({ alg, enc, kid: thumbprint })
    .setIssuedAt()
    .setExpirationTime(now() + maxAge)
    .setJti(crypto.randomUUID())
    .encrypt(encryptionSecret);
  const spend4 = Date.now();
  console.log('encode------------------------总耗时：', Date.now() - startTime, `其中, getDerivedEncryptionKey耗时：${spend2 - startTime}, calculateJwkThumbprint耗时：${spend3 - spend2}, EncryptJWT耗时：${spend4 - spend3}`, `第${count}次请求`);
  return res;
}

// for (let i = 0; i <= 100; i++) {
//   encode(params, i);
// }

const decodePrams = {
  secret: '8b5c5f7b6611219c61beb8f08b9fd108',
  maxAge: 1296000,
  token: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoicjhaUzFQbHB5OWphZzJRQWdxRVNCWFYxaEs5cjFhYzNqdmVqME5PbG1jZHR5WkQ0SEkyWExIMmtnYVhneHVqVmdVajlSWWx5REVrYklaLUVqbVpiNWcifQ..4lcYoXCH0r5VrbRiBW_2-Q.cPpvfpkndOvyNySjWinDw37xg1pA7nG8XnbYnWChufW5ieavToyxFdBTdgHIHQ_ugtAluKcVm54Zkur3eAUgnlJdLtt2eAE_EsVIODs6CUdnRhBQxjVpmSVgEj7qDDFbaWu9Cu8ljd5cG4sff5dOWCGaZOnVC1zc4TXFel7UN_VmmArt_QaDHAxsKi9Pzqqa5jb_fMX53-0AdP0xsQpTSQYVOtYpLoFuvzKUi76AK8ykN3gyToLMecbWEUbY-e-Kfs-ZQp-UveCeQ65Nnf3MKp9fif6u5XRwevk1OczUsTr5KS59eoYL7huSwHTowdptjJqzo_UIILG3yQO1jmbRiVuGKXVC3S-RiMGdbUe_t-uLv_21iwBkEkjuhURFYeRcyi8FjAuPij64hKc--E2F4FnsRZhUcnMvQd89RvWYB5jFRk2zIARBHoVf0JKxfXjScfn_lIxjmKDrwNe-fG9uMopJTmAmz5ZmV7tp7U33P4kJpI18rdvzv2I3HZ0LbGQ5kgvEDkslc7DmETIiF3ZbhinkqQ10qTLttEsXrvTcZispAQhbwoc2TJFddCEzrmOoN3UQ5dYiY7ZHmkPEtif3RjATY-wMsJktpJBgmDzyI_FD6B2CSerIE5y_PLooGi2ZsfS3vsjIgswn3cc8QQXqt3_8SgeRJyj2uq8dqJU0CxUk3Qnh83MwLPdUGkGFOD3AgC7FPBMS8C2nuStluTkRap2TPohkw7Q1ICal5HKw384ov_btAsnvS44iAwjBVpwY01AMv2tSP9aejIWIwS7kVKHzbeT1l6d20yqkFxLyL27vilirxEk-u53krHqY8g08MiVoVFOwMjJFp9qRiXNrMM8r0_BNrMZarDouqxFymrc_X0XMS8uaDTbV9cjwpFAcoePRv0rwUwEjp4GGD09Exia9raoKjDALKo1add88Y3a69n6c6IXc1iK-HWzLDvK7AUKKHoSUCtOSJAO0Rm4c8-lhsJq3RqLNBjoww-ZU8Q9JQ-VO-uYip5WeAZYa9VVWaxP1qMl85RcxAFHjkLvVEjBMYEwGwgkk8FwTBbBrGYI-GOEv3yTiQCQ16ANdm4QeBHiJ_kpAUnqhaqxOIPCpjc8o3EuosNMgfattqvjifuO-YfvQpE26u-TtaDNjhB7NJxs77AqDg_R39GNrXH9Ch_t6YikbTQfoTbNMbGnC3tDr-Q8o3eyLQTqfGwMKvJOpuOIUBP9EMixx9NWpBEGmbhJnHP8xrk0WLk2W6h47LgvLF3P5dlqtn9HLdSOj3xExBaivNNWR5JhmscxQAM9nxhogm8448hmzC89kBi6gJS_yztNssTeUBnyIpp6syWeNOPBn4_06otG0GLW5i7k7rJolmayCbOpaSSLwDXLyysbH82o-EOob39t9-3rYdgerqmcqJDFnVCq0ph7s7eVL20sZ1y_qpfFaAC6HWz_cnml9xY3Sl4f7yavweSwlLk6yBj5hmpMTW_TsNwNSgQaCOdhfXpeeWytggb4qla62Emtobsq7IHSy9QPP7wWeqBcLdLRZ8V6Vi3NVohRLEyF_jAynubnl-GSlC-7zcABMRoNjmJDcr5wEQ3Teu1VUFVQEtmhuA84lKFnDACe2DoYXkdDsABz4GINOtXwAaORkbN_3P6X-3TNbfWL2unoNghu9NtqhLIPcMA3kGgZh-lfK8HBKAP2cYGb8WWQ4AZ_2-q3oEqiOLvufceSYDJxLQMH252EyhXPugyRrg1kUm8cNNqoCO16hNJYdU4MMD8ZLNgjYMnQQoR2m0qQX3x6QqN7LRcA6mSVVc9Q8r5HyrlQer71mdZSi-9lEq7l6mWEUqve3dqe04l29O8Bdx1WJFVzDqEM9koVDqOTwYmPGt94_c7ZIA-0T-dFcnElZ3RSjK3g3YZ02QLSRYqgeMxwJKCSWRY1BfIqvYWpGbVfcJyB5pGez2ke8WBc8B9gHLKbp3DdjeHHRgCHvVcUgDXHp6lAiXFWK7JwVDn4Cm_b7uCzXJq1_DRdDRxbH1zaCsUik3JvwG0Ug2X_4OT6cFGkGPJUSCpWx-UT3H1D8Wz0SIQCMKFbOMbXmn204FpU7AzJ5MTRT9is71NcgMMo5gl7ffqcC_o4NfNgmwMpfDRCeAK468rUUcGlEgDWyCva8rQbKy36q9rabeJp97TUp0R9SfAkWaJaw_3pvmVA_Z3e07RMLaads1yJm75fAk8OEInVXdkDGei_BA3dXrvL0XEwu-ouIDdhfU90pk3cNySxevr5crpLtIDgggAb-uYIP3mvdByi8GeCMIktDTGUUeFc88AS_6cPgd98oyJO7asqA0yfgTir9DQDNwdGnI3Dh5VKdQ9-rVcFe-0iQG7g__8THM5gES7BANlU7IdAoleCt7bKdgLUzGuiFEB6T7jOruCp_mZDKEXJSOcoH5j55FuRyTtwvgmO2wZP10-qMEbJs60aBVuSisoZ-5xYCuUJxCYu0AYHOSag5S917wcijS08hXFnirStC7Z9TliWb2rNGmRJZEQAbFzp0XXKvFaMdRF1DtLRUINtVPRz4Vq9TgeD5iUHbfUMleUSKnzHEUwzCtyzDox-1rkV8cLPaBy2LV9BgT7i8DoiPsqqr3YHs0DtHKp-4P37QTEAn_ceyR-v8vIHG_6Jh3sr-6rqgfuwq1ztxLI8U_Gu4n2vZCyXb0O9uQGNdbv4C6FChVDorQRVmYfliLsW1nxKpUb0vB3oRY9pVKtJIPD2YR3N9NTxaz3DCRLGC3L5u1iy6N5qLAHHuxqon1jFMb5Ba2KQ7GNOhJ2_pwls.uaNh78JCiXQpeZYk82cMneJlXYbQF4yw2CiBnutlSho',
  salt: '__Secure-authjs.session-token',
};
/** Decodes an Auth.js issued JWT. */
export async function decode(params, count) {
  const { token, secret, salt } = params;
  const secrets = Array.isArray(secret) ? secret : [secret];
  if (!token) {
    return null;
  }
  const startTime = Date.now();
  const { payload } = await jwtDecrypt(token, async ({ kid, enc }) => {
    for (const secret of secrets) {
      const encryptionSecret = await getDerivedEncryptionKey(enc, secret, salt);
      if (kid === undefined) {
        return encryptionSecret;
      }
      const thumbprint = await calculateJwkThumbprint({ kty: 'oct', k: base64url.encode(encryptionSecret) }, `sha${encryptionSecret.byteLength << 3}`);
      if (kid === thumbprint) {
        return encryptionSecret;
      }
    }
    throw new Error('no matching decryption secret');
  }, {
    clockTolerance: 15,
    keyManagementAlgorithms: [alg],
    contentEncryptionAlgorithms: [enc, 'A256GCM'],
  });
  console.log('decode耗时：', Date.now() - startTime, `第${count}次请求`);
  return payload;
}
for (let i = 0; i <= 100; i++) {
  decode(decodePrams, i);
}
async function getDerivedEncryptionKey(enc, keyMaterial, salt) {
  let length;
  switch (enc) {
    case 'A256CBC-HS512':
      length = 64;
      break;
    case 'A256GCM':
      length = 32;
      break;
    default:
      throw new Error('Unsupported JWT Content Encryption Algorithm');
  }
  return await hkdf('sha256', keyMaterial, salt, `Auth.js Generated Encryption Key (${salt})`, length);
}
```

#### 测试encode方法的耗时
100次请求，结果如下:

![image](./images/encode.png)

#### 测试decode方法耗时
100次请求， 结果如下：

![image](./images/decode.png)

## 问题排查结论

调用`await auth()`方法的执行耗时，等于调用 `createHash` + `encode` + `decode`这三个方法的耗时总和。这三个方法又刚好是CPU密集型的任务。当并发量大时，后续所有的请求都得排队等待处理，导致auth的耗时增加

## 优化方法
### 一、按需调用 auth
fetchwithcache方法暴露useAuth配置，默认false。如果需要认证的接口才调用auth

```js
// 只有当 useAuth 为 true 时才获取 session
if (useAuth) {
  // 使用 React Cache 缓存 auth 调用，同一请求周期内只执行一次
  // 避免重复调用导致的 CPU 密集型操作（createHash + jwt.encode + jwt.decode）
  const session = await getCachedSession();
  const uid = session?.user.uid || '';

  // 将 uid 添加到 params
  finalParams = params ? { ...params, uid } : { uid };
}
```
### 二、使用react cache缓存
- 首次调用 fetchWithCache：执行 auth()，耗时 ~60ms
- 后续调用 fetchWithCache：直接返回缓存结果，耗时 ~0ms
```js
const getCachedSession = cache(async () => {
  return await auth();
});
```

### 三、优化效果：
既满足了在公共方法统一获取session的需求，又兼顾了性能
![image](./images/opt.png)

## 参考文章
- [【Node】Node是否单线程？实例讲解线程池原理](https://juejin.cn/post/7296317316207214603)
