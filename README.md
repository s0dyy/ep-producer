**EP PROJECT**
&nbsp;

The main goal is to compare the version of an Exherbo Linux package with the upstream version, and be notified via Slack if a new version is available.

**EP-PRODUCER**
&nbsp;

Browse Exherbo linux packages, create an object and send it to Apache Pulsar.

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
},
{
  "repository": "CleverCloud",
  "category": "net",
  "name": "varnish",
  "exheres": "varnish-4.1.3.exheres-0",
  "exlib": null,
  "files": [
    "files",
    "files/systemd",
    "files/systemd/varnish.service",
    "files/systemd/varnishlog.service",
    "files/systemd/varnishncsa.service",
    "files/varnish_reload_vcl",
    "files/varnish.params"
  ],
  "versions": "4.1.3",
  "mostRecentVersion": "4.1.3",
  "mostRecentVersionIsValid": true,
},
... 6282 more items
```
