# PRD — WFC Community App

**Working title:** WFC  
**Product type:** Community / Social / IRL Networking  
**MVP target:** Existing WFC community  
**Primary market:** Remote workers, freelancers, founders, creators, developers, designers, and professionals who regularly work outside home.

---

## 1. Product Overview

### Product Vision

Make WFC more than working somewhere outside home. Make it an easy way to **meet relevant people, build connections, and discover opportunities**.

### MVP Promise

> **Find people to work with, places to work, and events to join.**

The MVP should let a user answer these questions in under one minute:

1. Who is WFC today?
2. Where are they WFC?
3. Who can I join?
4. Who might be worth meeting?

---

## 2. Problem Definition

### 2.1 Core Problem

People who work remotely often want to work outside home, but doing so has significant social friction.

When someone thinks:

> “Besok WFC ah.”

They may not know:

- Where to go.
- Whether other community members are WFCing.
- Where those people are.
- Whether they can join an existing group.
- Who there might be relevant to meet.
- Whether there is an event or gathering worth attending.

As a result, WFC often becomes:

> **“Gue kerja sendirian di coffee shop.”**

The community's potential value is not only the place, but the **people and connections** around it.

### 2.2 Existing Behavior

Before the app, members may coordinate through:

- WhatsApp groups
- Telegram
- Instagram
- Personal DMs
- Google Maps
- Spreadsheets
- Event platforms

Information becomes fragmented.

Typical conversation:

> “Besok ada yang WFC?”

> “Gue.”

> “Di mana?”

> “Belum tahu.”

> “Jam berapa?”

> “Kayaknya jam 10.”

The same coordination happens repeatedly.

### 2.3 Product Opportunity

The community already has a social graph: people who know each other or belong to the same community.

What is missing is a **structured layer for WFC activity**.

Instead of:

> “Ada yang WFC besok?”

The product can show:

> “12 people are WFCing tomorrow. 7 are at Coffee Shop A and 5 are at Coffee Shop B.”

Then:

> “I’ll join the group at Coffee Shop A.”

---

## 3. Product Goals

### Primary Goal

Increase **real-world interactions** between members of the WFC community.

### MVP Goals

1. Users can easily discover WFC sessions.
2. Users can declare that they are attending.
3. Users can see who is attending.
4. Users can discover people based on profile and interests.
5. Users can discover and RSVP to community events.
6. The community gets a structured alternative to repeated WFC coordination in chat groups.

---

## 4. Non-Goals

The MVP is **not** intended to become:

- A full coworking booking platform.
- A chat application.
- A LinkedIn replacement.
- A dating app.
- A project marketplace.
- A job marketplace.
- A generic social media platform.
- A productivity tracker.
- A workspace management system.

### MVP focus

> **WFC → People → Connection → Community**

---

## 5. Target Users

### Persona 1 — Remote Worker

**Example:** Andi, 29

- Remote software engineer.
- WFCs 2–3 times per week.
- Gets bored working alone at home.
- Wants to meet people.
- Doesn't always want to attend formal networking events.

**Need:**

> “Gue pengen kerja di luar rumah, tapi kalau bisa sekalian ketemu orang.”

### Persona 2 — Freelancer

**Example:** Sarah, 27

- Designer.
- Works freelance.
- Frequently works from cafés.
- Wants to network.
- Could potentially get clients or referrals.

**Need:**

> “Gue pengen ketemu orang yang bisa jadi connection kerja.”

### Persona 3 — Founder

**Example:** Budi, 32

- Startup founder.
- WFCs regularly.
- Wants to meet talent, partners, and other founders.

**Need:**

> “Gue nggak mau networking event formal setiap minggu. Kalau ketemu orang organically sambil kerja lebih enak.”

---

## 6. Core User Journey

```text
OPEN APP
   ↓
SEE TODAY'S WFC
   ↓
DISCOVER SESSION
   ↓
SEE WHO'S GOING
   ↓
JOIN
   ↓
SHOW UP
   ↓
MEET PEOPLE
   ↓
DISCOVER PROFILE
   ↓
FUTURE WFC / EVENTS
```

### WFC Loop

```text
Discover
   ↓
Join
   ↓
Attend
   ↓
Meet
   ↓
Return
```

### Community Loop

```text
Meet people
   ↓
Build connections
   ↓
Join more WFC
   ↓
Join events
   ↓
Invite others
   ↓
Community grows
```

---

# 7. MVP Information Architecture

Five primary screens:

```text
                    HOME
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
        WFC        PEOPLE     EVENTS
        SESSION
          │
          ↓
       PROFILE
```

Primary navigation:

- Home
- People
- Events
- Profile

WFC Session is entered from Home or other WFC-related surfaces.

---

# 8. Screen 1 — Home

## Purpose

Home is the **daily entry point**.

The user should immediately understand:

> **“What's happening in my WFC community today?”**

Home is not a social feed.

### Primary Question

> **“Where and with whom can I WFC today?”**

### Main Content

```text
Good morning, Herlangga 👋

Who's WFC today?

[ + I'm WFCing ]

TODAY

📍 Coffee Shop A
8 people
10:00 – 16:00

[ Join ]

📍 Coffee Shop B
5 people
09:00 – 15:00

[ Join ]

People you might want to meet

Andi
Developer · Startup

Sarah
Product Designer · SaaS

[ See all people ]

Upcoming

Founder WFC
Saturday · 10:00
12 spots left

[ View event ]
```

## User Stories

### US-H01 — Discover today's WFC

**As a** community member,  
**I want** to see where people are WFCing today,  
**so that** I can decide where I want to work.

#### Acceptance criteria

- User can see today's active/upcoming WFC sessions.
- Each session displays the location.
- Each session displays approximate attendee count.
- Each session displays time.
- User can open the session.

### US-H02 — Declare WFC intention

**As a** user,  
**I want** to tell the community that I am WFCing,  
**so that** other people can join me.

User taps **I'm WFCing**.

The user provides:

- Place.
- Start time.
- End time.

Optional:

- Note.
- Topic.

### US-H03 — Discover people

**As a** user,  
**I want** to see interesting people in my community,  
**so that** I can potentially meet or connect with them.

The Home screen should show a small number of relevant people without becoming a social feed.

### US-H04 — Discover events

**As a** user,  
**I want** to know about upcoming community activities,  
**so that** I don't have to monitor a WhatsApp group.

---

# 9. Screen 2 — WFC Session

## Purpose

This is the **core transaction screen**.

Home answers:

> “Where are people?”

Session answers:

> **“Who exactly is going and can I join them?”**

### Example

```text
← WFC Session

📍 Two Hands Full

Today
10:00 – 16:00

12 people going

[ I'm Going ]

────────────────

PEOPLE

Herlangga
Android Developer

Andi
Founder

Sarah
Product Designer

Budi
Software Engineer

[ See all ]
```

### Session Information

A session contains:

- Place.
- Date.
- Start time.
- End time.
- Attendee count.
- Attendee profiles.
- Optional note.

Example note:

> “I'll be working on my startup. Feel free to say hi.”

## User Stories

### US-S01 — Join WFC

**As a** user,  
**I want** to join an existing WFC session,  
**so that** I don't have to WFC alone.

After joining:

```text
✓ You're going

Two Hands Full
10:00 – 16:00

12 people going
```

CTA changes from **I'm Going** to **Leave**.

### US-S02 — See attendees

**As a** user,  
**I want** to see who else is attending before I decide to join,  
**so that** I know what kind of people I will meet.

The attendee list should be prominent.

### US-S03 — Understand social context

The user should be able to quickly understand:

> “There is a developer, designer, and founder here.”

This gives the user a reason to attend.

### US-S04 — Create a WFC session

**As a** user,  
**I want** to create my own WFC session,  
**so that** other members can join me.

Required:

- Place.
- Date.
- Start time.
- End time.

Optional:

- Note.
- Topic.

Example:

> “Working on mobile app. Happy to chat about startups.”

### US-S05 — Cancel attendance

**As a** user,  
**I want** to leave a WFC session if my plan changes,  
**so that** the attendee list remains accurate.

The attendee count should update accordingly.

---

# 10. Screen 3 — People

## Purpose

Turn the community from:

> **a list of people**

into:

> **a discoverable network.**

### Main View

```text
People

🔍 Search people

Suggested for you

┌───────────────────┐
│ Andi              │
│ Android Developer │
│ Startup · AI      │
│                   │
│ WFC today         │
└───────────────────┘

┌───────────────────┐
│ Sarah             │
│ Product Designer  │
│ SaaS · Design     │
└───────────────────┘
```

### Profile Card

Minimum information:

- Name.
- Profile photo.
- Role.
- Company/project.
- Interests.
- What they're looking for.
- WFC status.

### Example

```text
Sarah

Product Designer
Freelancer

Interested in:
SaaS · AI · Startups

Looking for:
Founders · Developers

🟢 WFC today
```

## User Stories

### US-P01 — Browse community

**As a** user,  
**I want** to browse people in the community,  
**so that** I can discover people I don't already know.

### US-P02 — Search people

**As a** user,  
**I want** to search by name, role, or interest,  
**so that** I can find relevant people.

Example:

```text
developer
```

Results:

```text
Andi
Mobile Developer

Budi
Backend Engineer

Dimas
Fullstack Developer
```

### US-P03 — Discover relevant people

**As a** user,  
**I want** the app to surface people who might be relevant to me,  
**so that** I don't have to manually search through everyone.

MVP matching can be simple and based on:

- Shared interests.
- Same profession.
- Similar goals.
- Same WFC session.
- Same community.

### US-P04 — View profile

**As a** user,  
**I want** to understand someone's professional/social context before approaching them,  
**so that** I have an icebreaker.

The profile should answer:

> “Who is this person and why might I want to talk to them?”

---

# 11. Screen 4 — Events

## Purpose

WFC is the recurring behavior.

Events are the **higher-value community activity**.

Possible events:

- Founder WFC.
- Design WFC.
- Startup Night.
- Casual Dinner.
- Running + WFC.
- Demo Day.
- Skill sharing.
- Community meetup.

### Event List

```text
Events

THIS WEEK

Founder WFC
Sat · 10:00
15 / 20 people
Rp50k

Designers WFC
Sun · 09:00
8 / 15 people
Free

Community Dinner
Wed · 19:00
12 / 20 people
Rp75k
```

### Event Detail

```text
Founder WFC

Saturday
10:00 – 15:00

📍 Venue X

15 / 20 joined

About

Casual WFC for founders and
people building startups.

What to expect:

• Work together
• Meet other founders
• Casual networking

[ Join Event ]
```

## User Stories

### US-E01 — Discover event

**As a** user,  
**I want** to discover upcoming community events,  
**so that** I don't miss activities relevant to me.

### US-E02 — Understand event

**As a** user,  
**I want** enough information to decide whether an event is worth attending.

Event details should include:

- What.
- When.
- Where.
- Who it's for.
- Price.
- Number of participants.
- Description.

### US-E03 — RSVP

**As a** user,  
**I want** to reserve my spot,  
**so that** I know I'm registered.

### US-E04 — See attendees

**As a** user,  
**I want** to know who is attending before I go,  
**so that** I can understand the social context.

Example:

```text
People you may know

Andi
Sarah
Budi
+ 12 others
```

---

# 12. Screen 5 — Profile

## Purpose

The profile is not intended to become a social-media profile.

It exists to answer:

> **“Who are you and why should someone talk to you?”**

### Example

```text
[ Photo ]

Herlangga

Android Developer
Founder @ XERV

📍 Bandung

ABOUT

Mobile engineer interested in
building products and startups.

INTERESTS

AI
SaaS
Mobile
Startups
Padel

LOOKING FOR

☑ Founders
☑ Developers
☑ Clients
☑ Collaborators
```

### WFC Preferences

```text
WFC Preferences

Usually WFC:
☑ Weekdays

Preferred time:
10:00 – 17:00

Preferred places:
Cafes
Coworking spaces
```

## User Stories

### US-PF01 — Create profile

**As a** new user,  
**I want** to create a simple profile,  
**so that** other members know who I am.

### US-PF02 — Express interests

**As a** user,  
**I want** to list my interests,  
**so that** I can find people with similar interests.

### US-PF03 — Express intent

**As a** user,  
**I want** to tell people what I am looking for,  
**so that** relevant people can identify potential connections.

Options:

```text
☑ Friends
☑ Networking
☑ Clients
☑ Collaborators
☑ Co-founders
☑ Talent
☑ Mentors
☑ Learning
```

---

# 13. Onboarding

Although the MVP has five primary screens, onboarding is required.

The goal is not to build a complete profile.

### Target

> **Get a new user into the community in under 2 minutes.**

### Step 1 — Name

```text
What's your name?
```

### Step 2 — Role

```text
What do you do?

Developer
Designer
Founder
Freelancer
Creator
Marketing
Other
```

### Step 3 — Interests

```text
What are you interested in?

AI
Startups
Design
Technology
Business
Finance
Fitness
...
```

### Step 4 — Intent

```text
What are you looking for?

Networking
Friends
Clients
Collaborators
Co-founder
Learning
```

### Step 5 — Completion

```text
You're ready to WFC.

[ See who's WFC today ]
```

---

# 14. Core Product Loop

The MVP should optimize this loop:

```text
                   ┌─────────────┐
                   │ Open App    │
                   └──────┬──────┘
                          ↓
                   Who's WFC?
                          ↓
                   Find Session
                          ↓
                      Join
                          ↓
                  See Attendees
                          ↓
                    Meet IRL
                          ↓
                  Discover People
                          ↓
                   Return Again
```

### Critical behavior

The desired habit is:

> **“Cek app dulu, siapa yang WFC hari ini.”**

instead of:

> “Ada yang WFC nggak?”

in WhatsApp.

---

# 15. Key Product Metrics

Keep MVP measurement simple.

## North Star Metric

### Weekly WFC Connections

Number of users participating in a WFC interaction in a week.

For MVP, define this as:

> A user joins a WFC session where at least two people attend.

The goal is not merely:

> “People opened the app.”

The goal is:

> **“People used the app to meet other people.”**

## Supporting Metrics

### Activation

Percentage of new users who:

```text
Complete profile
       ↓
Join or create WFC
```

### WFC Participation

Track:

- Number of WFC sessions created.
- Number of WFC sessions joined.
- Average attendees per session.

### Community Density

Percentage of active community members participating in WFC.

This is critical because community products become more useful when the number of active participants increases.

### Retention

Track:

- Week 1.
- Week 4.
- Month 2.

Key question:

> Do people return for their next WFC?

### Event Conversion

```text
Event views
    ↓
RSVP
    ↓
Attendance
```

---

# 16. MVP Success Criteria

The MVP is successful when the following behavior appears naturally.

### Behavior

Users start thinking:

> **“Cek app dulu, siapa yang WFC hari ini.”**

instead of relying entirely on chat groups.

### Organic session creation

Members start creating WFC sessions **without admin prompting them**.

This is a critical signal.

If every session must be created by an admin, the product has not yet become a community habit.

### Repeat usage

Users return to the app for subsequent WFC sessions.

### Social discovery

Users discover people outside their existing friend circle.

---

# 17. Monetization Strategy

## Principle

**Do not monetize the core WFC experience too early.**

First prove:

> **Does the community actually want this?**

Once usage is validated, monetize the activity around the community.

---

## Revenue Layer 1 — Paid Events

Example:

```text
Founder WFC

Rp50.000
20 seats

Gross:
Rp1.000.000
```

The product can take a service fee.

---

## Revenue Layer 2 — Venue Partnerships

Example:

```text
WFC Package

Coffee + workspace
Rp35.000
```

The venue gets customers.

The app can earn a commission.

---

## Revenue Layer 3 — Sponsored Venues

Example:

```text
FEATURED WFC SPOT

☕ Venue X

Special WFC package
10% discount for members
```

Venues pay for exposure to the community.

---

## Revenue Layer 4 — Premium

Only after the network has meaningful density.

Potential features:

```text
WFC Pro

Advanced people discovery
Who is WFC nearby
Interest matching
Founder/freelancer groups
Priority event access
```

Pricing should be validated later rather than assumed in MVP.

---

# 18. What NOT to Build in MVP

### Do not build Chat

Members already have WhatsApp/Telegram.

### Do not build Direct Messaging

First prove that people discovery and IRL interaction work.

### Do not build AI Matching

Start with simple matching.

### Do not build Payment

If the first events are free, don't build a payment system yet.

### Do not build Venue Booking

Users only need to select a venue.

### Do not build Venue Reviews

Not necessary for the initial hypothesis.

### Do not build Gamification

No points, badges, or leaderboards.

### Do not build a Feed

**Do not turn this into social media.**

The core value should remain:

> **“Who's WFCing?”**

---

# 19. MVP Feature Prioritization

| Feature | Priority |
|---|---:|
| Login / onboarding | P0 |
| Profile | P0 |
| Create WFC | P0 |
| See today's WFC | P0 |
| Join WFC | P0 |
| See attendees | P0 |
| People directory | P0 |
| Basic search | P1 |
| Events | P1 |
| RSVP events | P1 |
| Interest matching | P1 |
| Notifications | P1 |
| Chat | P2 |
| Payment | P2 |
| Venue booking | P2 |
| AI matching | P2 |
| Reviews | P2 |
| Gamification | P3 |

---

# 20. MVP Hypotheses

The MVP is testing three core hypotheses.

## H1 — WFC Coordination Problem

> People want to know who else is WFCing.

### Signal

People repeatedly open the app to check WFC sessions.

---

## H2 — People Are the Product

> Seeing who will be there increases the likelihood of joining a WFC session.

### Signal

Sessions with visible attendees generate more joins and attendance.

---

## H3 — Community Can Become a Network

> People care about discovering members beyond the people they already know.

### Signal

Users browse profiles and discover people outside their existing social circle.

---

# 21. Product Positioning

The MVP should **not** be positioned as a coworking booking app.

### Positioning

> ## WFC — Work together, even when you work remotely.

### Core interaction

> **“Who's WFC?”**

The venue is context.

Events are a mechanism.

**People are the core asset.**

---

# 22. Future Product Evolution

If the MVP proves the core behavior, the product can evolve:

```text
WFC
 ↓
Find people
 ↓
Meet people
 ↓
Build relationships
 ↓
Community
 ↓
Opportunities
```

Potential future directions:

- Professional networking.
- Community groups.
- Venue partnerships.
- Paid events.
- Talent discovery.
- Founder networking.
- Collaboration opportunities.
- Local professional communities.

The long-term opportunity is not simply:

> “An app for coworking.”

It is:

> **Infrastructure for communities of people who work remotely and want meaningful real-world connections.**

---

# 23. Product Principle

The product should always optimize for:

> **More meaningful people meeting in real life.**

Not:

> More posts.

Not:

> More messages.

Not:

> More screen time.

Not:

> More features.

The app succeeds when the user eventually **closes the app and goes WFC**.
