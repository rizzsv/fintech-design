
---

## 3. `dashboard-feature.md`

File ini berisi **spesifikasi khusus endpoint dashboard backend**.

File ini menjawab:

> Dashboard harus menampilkan data apa, dari mana datanya, dan aturan perhitungannya bagaimana?

Contoh isi:

```md
# Dashboard Feature Specification

## 1. Overview

Dashboard digunakan untuk menampilkan ringkasan akun dan aktivitas finansial
user yang sedang login.

Endpoint utama:

```http
GET /api/v1/dashboard