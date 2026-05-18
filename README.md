# ProxyListChecker

Windows WinForms клиент для **массовой проверки** уже готовых публичных списков прокси. Собирает HTTP/HTTPS/SOCKS4/SOCKS5 из 25+ известных GitHub-репозиториев и API-агрегаторов, прогоняет каждый через `HttpClient` с реальным запросом на тест-URL и помечает рабочие с exit IP / latency / anonymity.

## Версия

`0.2.1`

Версионирование по SemVer (`0.X.0` — фича, `0.X.Y` — фикс).

## Поток работы

1. **Собрать** — скачивает все источники из текстбокса, парсит `host:port` / `type://user:pass@host:port`, дедуплицирует.
2. **Фильтр типа** — оставить только HTTP / SOCKS5 / etc., если нужно.
3. **Проверить** — параллельно (по умолчанию 100 потоков), через каждый прокси идёт `GET https://api.ipify.org` с таймаутом. OK = успешный ответ + извлечён exit IP.
4. **Сохранить рабочие** / **Копировать** — экспорт в `valid_proxies.txt` + раскладка по типам в `by_type/http.txt` и т.п.

## Технологии

- .NET 8 + WinForms
- Нативная поддержка SOCKS4/5 в .NET 6+ (`WebProxy("socks5://...")` + `SocketsHttpHandler`)
- Кэш проверок `test_cache.json` (TTL: 30 мин OK / 10 мин FAIL)
- Тема «Матрица»
- Self-update через GitHub releases ([greyka/ProxyListChecker](https://github.com/greyka/ProxyListChecker))

## Источники по умолчанию

См. [`default_sources.txt`](ProxyListChecker/default_sources.txt). Включены: TheSpeedX, monosans, ShiftyTR, proxifly, hideip.me, hookzof, clarketm, mmpx12, roosterkid, proxyscrape, proxy-list.download.

## Сборка

```
dotnet build ProxyListChecker/ProxyListChecker.csproj -c Release
```

CI публикует zip-релиз на push тега `v*` (см. [`.github/workflows/release.yml`](.github/workflows/release.yml)).

## Связано

- [greyka/ProxyHabSharp](https://github.com/greyka/ProxyHabSharp) — сосед, делает то же для **VPN-конфигов** (VLESS/VMess/Trojan/SS) через xray-knife.
