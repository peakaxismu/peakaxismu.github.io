# Hike routing contract

Peak Axis has two different concepts that must never share an identifier in URLs.

## Data model

- **hikes.id** identifies the general hike/route.
- **scheduled_hikes.id** identifies one specific scheduled departure.
- **scheduled_hikes.hike_id** is the foreign key back to the parent hikes.id.

Think of it as:

    hikes
      id = H
      name = "Le Chat et La Souris"
           |
           +---- scheduled_hikes.hike_id = H
                  scheduled_hikes.id = S1  -> one departure
                  scheduled_hikes.id = S2  -> another departure

## URL rules

### On-demand/general hike

Use the hike name slug:

    /hikes/<slug>

Example: `/hikes/le-chat-et-la-souris`

This route describes the reusable hike itself. It does not represent a particular date, capacity, price, or trail-condition snapshot.

### Scheduled group departure

Use **scheduled_hikes.id**:

    /hikes/scheduled/<scheduled_hikes.id>

Example: `/hikes/scheduled/4d332ca7-9efb-43de-a124-7023e795eb9d`

This route describes one exact departure and owns its date, price, capacity, availability, and departure-specific trail conditions.

## UI routing rules

| Surface | If scheduled departure exists | If none exists |
| --- | --- | --- |
| Hikes listing | `getScheduledHikeHref(scheduledHike.id)` / **Join this hike** | `getOnDemandHikeHref(hike.name)` / **Plan this hike** |
| Homepage featured scheduled hike | `getScheduledHikeHref(scheduledHike.id)` | N/A |
| Admin Scheduled Hikes “View live” | `getScheduledHikeHref(scheduledHike.id)` | N/A |
| Scheduled detail “View hike details” | parent hike route | N/A |

## Implementation rule

Do not rename or overwrite `scheduled_hikes.id` as `hikeId`, and do not use `scheduled_hikes.hike_id` as the scheduled URL identifier.

Prefer explicit names such as:

- `scheduledHikeId` = `scheduled_hikes.id`
- `hikeId` = `hikes.id`

Route construction is centralized in `lib/hike-routes.ts` so future UI work uses the same contract.

## Regression checklist

When adding or changing a hike card/link:

1. Is this an on-demand hike? Use `getOnDemandHikeHref(hike.name)`.
2. Is this a scheduled departure? Use `getScheduledHikeHref(scheduledHike.id)`.
3. Never use `scheduled_hikes.hike_id` in `/hikes/scheduled/...`.
4. Never use a scheduled departure ID in `/hikes/<slug>`.
5. Keep the parent hike ID and scheduled departure ID in separately named variables/types.
6. For a scheduled card, the displayed date/price/spots must come from `scheduled_hikes`, not the parent `hikes` row.
