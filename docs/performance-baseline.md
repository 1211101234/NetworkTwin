# Phase 1 Performance Baseline

Measured on 30 September 2026 on the local Apple Silicon development machine with Python
3.14.7. Each result is the median of five in-process runs. Serialization includes the DRF
response serializer and compact JSON encoding; it excludes HTTP transport and browser parsing.

| Profile | Assets | Generate median | Serialize median | JSON size |
| --- | ---: | ---: | ---: | ---: |
| demo | 151 | 0.4 ms | 2.0 ms | 0.08 MiB |
| 1k | 1,001 | 2.4 ms | 13.3 ms | 0.50 MiB |
| 5k | 5,061 | 12.6 ms | 64.7 ms | 2.53 MiB |
| 10k | 9,997 | 25.1 ms | 153.3 ms | 5.00 MiB |

The 10k profile is below the 1.5-second local topology-response budget before transport. The map
caps detailed assets at 2,000 through deterministic level-of-detail sampling and shows only
infrastructure layers at lower zoom levels. Browser frame-rate and interaction measurements remain
a follow-up because they require a stable scripted browser trace rather than visual observation.

Reproduce the server-side measurements from `backend/` with:

```shell
uv run python manage.py benchmark_topology --iterations 5
```
