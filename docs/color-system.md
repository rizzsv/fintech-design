# Color System — Quixotic Fintech

## add in global-css
:root {
  /* Primary Green */
  --color-green-dark:    #1A5C38;
  --color-green-primary: #1E7A48;
  --color-green-mid:     #25A05E;
  --color-green-light:   #A8D5BC;
  --color-green-tint:    #E8F5EE;

  /* Neutrals */
  --color-white:         #FFFFFF;
  --color-bg:            #F5F5F5;
  --color-border:        #E5E7EB;
  --color-text-muted:    #6B7280;
  --color-text-primary:  #111827;

  /* Status */
  --color-success:       #22C55E;
  --color-success-tint:  #DCFCE7;
  --color-warning:       #F59E0B;
  --color-danger:        #EF4444;
}

## Primary Green
| Token | Hex | Usage |
|-------|-----|-------|
| green-dark | #1A5C38 | Card background (Visa card), CTA hover |
| green-primary | #1E7A48 | Primary button, active nav, toggle active |
| green-mid | #25A05E | Chart bar active, badge background |
| green-light | #A8D5BC | Chart bar inactive, divider accent |
| green-tint | #E8F5EE | Card background tint, hover state bg |

## Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| white | #FFFFFF | Card surface, modal bg |
| bg | #F5F5F5 | Page background |
| border | #E5E7EB | Card border, divider |
| text-muted | #6B7280 | Label, subtitle, placeholder |
| text-primary | #111827 | Heading, body text |

## Status
| Token | Hex | Usage |
|-------|-----|-------|
| success | #22C55E | Status dot, positive badge |
| success-tint | #DCFCE7 | Badge background (successful) |
| warning | #F59E0B | Alert, pending state |
| danger | #EF4444 | Error, negative value |

## Rules
- CTA utama selalu `green-primary` background + white text
- Card background selalu `white`, bukan tint
- Chart bar inactive = `green-light`, active = `green-mid`
- Badge positif (+12.8%) = `success-tint` bg + `green-dark` text
- Jangan pakai warna di luar token ini tanpa approval