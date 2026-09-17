# RD Station CRM

The lead integration uses OAuth credentials stored server-side in `integration_credentials`.

Required environment variables:

- `RD_STATION_CRM_CLIENT_ID`
- `RD_STATION_CRM_CLIENT_SECRET`
- `RD_STATION_CRM_REDIRECT_URI`
- `RD_STATION_CRM_OWNER_ID`
- `RD_STATION_CRM_STAGE_ID` (optional)

`RD_STATION_CRM_OWNER_ID` is required to create a deal. `RD_STATION_CRM_STAGE_ID` is optional; when empty, RD Station selects its default stage.

OAuth callback:

`https://pascoalloteamentos.com.br/admin/integrations/rd-station/callback`

To inspect safe user identifiers without printing tokens:

```bash
php artisan tinker --execute="dump(app(\\App\\Services\\RdStationCrmService::class)->users());"
```

To reprocess one local lead:

```bash
php artisan leads:sync-rd <lead_id>
```

The command does not backfill historical leads and skips leads that already have an RD deal ID.
