# Edit Item — Design Spec

**Date:** 2026-06-03

## Overview

Allow any group member to edit an existing item's name, description, amount, and value. The primary use case is quick quantity adjustments — e.g. a character uses a healing potion and reduces the amount by one.

---

## Architecture

A shared `ItemForm` component holds the four editable fields and is used by both the existing `AddItemForm` and the new `EditItemModal`. No API calls happen inside `ItemForm` — it is purely presentational. Each consumer handles its own API interaction and loading/error state.

---

## Components

### `ItemForm` (new — `frontend/src/components/ItemForm.tsx`)

Controlled form component with four fields: Name, Description, Amount, Value.

**Props:**
- `initialValues?: { name: string; description: string; amount: string; value: string }` — pre-populates fields for edit mode; omit for blank create mode
- `onSubmit(values: { name: string; description: string; amount: string; value: string }): void`
- `onCancel(): void`
- `submitLabel: string` — e.g. "Add Item" or "Save Changes"
- `busy?: boolean`
- `error?: string`

**Amount field behaviour:** Stored as a string in local state so the user can fully clear the field while typing. Validated on submit: must be a non-negative integer (≥ 0). If invalid, shows an inline error and does not call `onSubmit`.

**Tests** (`frontend/src/test/__tests__/ItemForm.test.tsx`):
- Renders all four fields
- Pre-populates fields from `initialValues`
- Calls `onSubmit` with correct string values on valid input
- Shows inline error if amount is empty on submit
- Shows inline error if amount is negative on submit
- Calls `onCancel` when cancel is clicked

---

### `AddItemForm` (refactored — `frontend/src/components/AddItemForm.tsx`)

Refactored to render `ItemForm` internally. Manages its own `busy` and `error` state, calls `itemsApi.create()` on submit, then calls `onAdded(item)`. Externally identical to today — no changes to callers.

---

### `EditItemModal` (new — `frontend/src/components/EditItemModal.tsx`)

Modal wrapper that pre-populates `ItemForm` with an existing item's values and calls `itemsApi.update()` on submit.

**Props:**
- `item: Item`
- `groupId: string`
- `onSaved(): void`
- `onClose(): void`

On submit: calls `itemsApi.update(groupId, item.id, { name, description, amount: parseInt(amount), value })`. On success: calls `onSaved()`. On failure: shows inline error, stays open.

**Tests** (`frontend/src/test/__tests__/EditItemModal.test.tsx`):
- Renders with item values pre-populated
- Calls `itemsApi.update()` with correct args on submit
- Calls `onSaved()` after successful update
- Shows error message when API call fails
- Calls `onClose()` when cancelled

---

## Triggering the Edit

### BoardView

Each item card becomes clickable. Add a cursor pointer and subtle hover highlight to the card. Clicking fires a new `onEdit(item)` prop callback. The Move and Delete buttons remain; clicks on them do not propagate to the card's click handler (stop propagation).

### ListView

An "Edit" button added to each row's action column, between Move and Delete. Fires the same `onEdit(item)` callback.

---

## GroupPage State

Add `editing: Item | null` state alongside the existing `moving: Item | null`.

- `onEdit(item)` → sets `editing`
- `EditItemModal` renders when `editing` is non-null
- On save: `refresh()` then `setEditing(null)`
- On close: `setEditing(null)`

---

## Backend Change

**`PATCH /api/groups/:groupId/items/:itemId`** — change `amount` validation from `z.number().int().min(1)` to `z.number().int().min(0)`.

The `POST` (create) route keeps `min(1)` — unchanged.

---

## Data Flow

1. User clicks item card (board) or Edit button (list) → `GroupPage` sets `editing`
2. `EditItemModal` opens, pre-populated with item values
3. User edits fields, submits
4. `EditItemModal` calls `itemsApi.update()` (PATCH)
5. On success → `GroupPage.refresh()` re-fetches items, clears `editing`
6. On failure → inline error shown, modal stays open

---

## Error Handling

- API failure: `EditItemModal` displays an inline error via `ErrorText`, stays open for retry
- Invalid amount (non-integer, negative): caught by `ItemForm` before API call, shown as inline field error
- Empty amount: same inline validation

---

## Out of Scope

- Changing item ownership (`memberId`) — use the existing Move flow
- Deleting an item from the edit modal — use the existing Delete button
- Optimistic updates — full refresh on save, consistent with existing pattern
