# WanderGuide - Dantewada District

## Current State
- Tourism Finder app with location cards, category filters, search, reviews, and an AI travel chatbot
- Backend stores tourist locations but starts empty (no pre-seeded data)
- Search works on backend data — finds nothing if no data is added
- Chatbot is entirely frontend/static, uses generic POI names and bus routes not specific to any region

## Requested Changes (Diff)

### Add
- A large set of pre-seeded Dantewada district locations (cities, towns, villages, landmarks, parks, temples) loaded into the backend on first run
- Backend `seedDantewadaData` / `isDataSeeded` functions to seed data once
- Dantewada-specific chatbot knowledge: real place names, local transport notes, district overview, village names
- Quick suggestion chips in chatbot updated to Dantewada examples (e.g. "How to reach Bailadila?", "Villages near Dantewada")

### Modify
- Backend: Add `isSeeded` flag and `seedDantewadaData()` function that inserts all Dantewada locations on first call
- Frontend App.tsx: On mount, call `isSeeded` and if false, call `seedDantewadaData()` to populate the database
- TravelChatBot: Enrich with Dantewada-specific context — district info, real towns, transport options, tourist spots
- Search placeholder updated to "Search Dantewada — cities, villages, landmarks..."

### Remove
- Nothing removed

## Implementation Plan
1. Update backend main.mo to add seed flag, seed function with 40+ Dantewada locations (cities, towns, villages, temples, waterfalls, wildlife areas)
2. Update frontend App.tsx to check and call seed on load
3. Update TravelChatBot.tsx with Dantewada-specific knowledge base (real places, local transport, district facts)
4. Update search placeholder and hero text to reflect Dantewada focus

## UX Notes
- Seeding should happen silently in the background on first load
- Chatbot should recognize Dantewada place names and respond with specific local info
- Quick suggestions should show Dantewada-specific examples
