**EPN PROJECT**
&nbsp;

The main goal is to compare the version of an Exherbo Linux package with the upstream version, and be notified via Slack if a new version is available.

**EPN-PRODUCER**
&nbsp;

Browse Exherbo linux packages, create an object and send it to Apache Pulsar.

Structure of an object (**WORK IN PROGRESS**)
```yaml
Pkg {
  repository: 'CleverCloud',
  category: 'net',
  pn: 'sozu',
  exheres: [
    'sozu-0.11.50.exheres-0',
    'sozu-0.12-scm.exheres-0',
    'sozu-scm.exheres-0'
  ],
  exlib: 'sozu.exlib',
  files: null,
  pv: [ '0.12.0', '0.11.50', 'scm' ],
  mostRecentPv: '0.12.0'
},
Pkg {
  repository: 'CleverCloud',
  category: 'net',
  pn: 'varnish',
  exheres: 'varnish-4.1.3.exheres-0',
  exlib: null,
  files: [
    'files',
    'files/systemd',
    'files/systemd/varnish.service',
    'files/systemd/varnishlog.service',
    'files/systemd/varnishncsa.service',
    'files/varnish_reload_vcl',
    'files/varnish.params'
  ],
  pv: '4.1.3',
  mostRecentPv: '4.1.3'
}
...
```
