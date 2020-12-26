**EP-PRODUCER**
&nbsp;

Compare the version of an Exherbo Linux package with the upstream version, and be notified via Slack if a new version is available.

Structure of an object (**WORK IN PROGRESS**)
```yaml
{
  "repository": "CleverCloud",
  "category": "net",
  "name": "sozu",
  "exheres": [
    "sozu-0.11.50.exheres-0",
    "sozu-0.12-scm.exheres-0",
    "sozu-scm.exheres-0"
  ],
  "exlib": "sozu.exlib",
  "files": null,
  "versions": [
    "0.12.0",
    "0.11.50",
    "scm"
  ],
  "mostRecentVersion": "0.12.0",
  "mostRecentVersionIsValid": true,
  "upstream": "github",
  "upstreamUrl": "https://github.com/sozu-proxy/sozu"
  "upstreamRegex": "require github [ user=sozu-proxy force_git_clone=true ] cargo"
},
{
  "path": "repositories/CleverCloud/packages/dev-pecl/memcached",
  "repository": "CleverCloud",
  "category": "dev-pecl",
  "name": "memcached",
  "exheres": [
    "memcached-3.1.5.exheres-0",
    "memcached-2.2.0-r1.exheres-0"
  ],
  "exlib": null,
  "files": null,
  "versions": [
    "3.1.5",
    "2.2.0"
  ],
  "bestVersion": "3.1.5",
  "bestIsValid": true,
  "upstream": "pecl",
  "upstreamUrl": "https://pecl.php.net/get/memcached",
  "upstreamRegex": "require php-pecl [ module=module php_abis=[ 7.0 7.1 7.2 7.3 7.4 ] ]"
},
... 6282 more items
```
