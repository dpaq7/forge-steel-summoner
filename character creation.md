This comprehensive document outlines the steps and available choices for creating a Level 1 hero in *Draw Steel*, designed for easy interpretation by a coding agent.

***

# Draw Steel Character Creation Guide (Level 1)

## I. Character Creation Flowchart

The process for creating a hero follows these main steps, culminating in a detailed character sheet.

```mermaid
graph TD
    A[Start: Conceptualize Hero] --> B{Choose Ancestry};
    B --> C{Choose Culture};
    C --> D{Choose Career};
    D --> E{Choose Class};
    E --> F[Establish Core Stats and Resources];
    F --> G[Acquire Starting Skills & Abilities];
    G --> H{Determine Kits / Free Strikes};
    H --> I{Complications (Optional)};
    I --> J[Finalize Details & Connections];
```

***

## II. Step-by-Step Character Choices

### Step 1: Conceptualize Hero (Think)

Determine the hero’s fundamental concepts: fighting style (weapons, magic, psionics), non-combat strengths, prior occupation (Career), motivation for adventuring, and overall personality.

### Step 2: Choose Ancestry

Select one species, which determines physical traits, inherent abilities, size, and starting characteristics adjustments.

| Ancestry (12 Choices) | Default Size / Speed / Stability | Key Mechanical Grants |
| :--- | :--- | :--- |
| **Devil** | 1M / 5 / 0 | Silver Tongue (Interpersonal skill benefit); 3 Ancestry Points. |
| **Dragon Knight** | 1M / 5 / 0 | Wyrmplate (Level-based Damage Immunity); 3 Ancestry Points. |
| **Dwarf** | 1M / 5 / 0 | Runic Carving (Detection/Light/Voice rune magic); 3 Ancestry Points. |
| **Wode Elf** | 1M / 5 / 0 | Wode Elf Glamor (Edge on Hide/Sneak); 3 Ancestry Points. |
| **High Elf** | 1M / 5 / 0 | High Elf Glamor (Edge on Presence/Flirt/Persuade); 3 Ancestry Points. |
| **Hakaan** | **1L (Large)** / 5 / 0 | Big! (Size 1L); 3 Ancestry Points. |
| **Human** | 1M / 5 / 0 | Detect the Supernatural (Maneuver to sense supernatural); 3 Ancestry Points. |
| **Memonek** | 1M / 5 / 0 | Fall Lightly (Reduces fall distance); Lightweight (Reduces effective size for forced movement); 4 Ancestry Points. |
| **Orc** | 1M / 5 / 0 | Relentless (Free strike when reduced to Dying); 3 Ancestry Points. |
| **Polder** | **1S (Small)** / 5 / 0 | Shadowmeld (Maneuver to hide); Small!; 4 Ancestry Points. |
| **Revenant** | Varies / 5 / 0 | Former Life (Retain size/speed of past ancestry); Tough But Withered (Level-based immunity to Cold, Corruption, Lightning, Poison; Fire Weakness 5); 2 or 3 Ancestry Points. |
| **Time Raider** | 1M / 5 / 0 | Psychic Scar (Level-based Psychic Immunity); 3 Ancestry Points. |

### Step 3: Choose Culture

Select three aspects of the hero’s upbringing community to define cultural traits and grant three starting skills.

1.  **Language:** Gain one cultural language (in addition to Caelian).
2.  **Environment (Selects 1 Skill Group):** Nomadic (Exploration/Interpersonal), Rural (Crafting/Lore), Secluded (Interpersonal/Lore), Urban (Interpersonal/Intrigue), or Wilderness (Crafting/Exploration).
3.  **Organization (Selects 1 Skill Group):** Bureaucratic (Interpersonal/Intrigue) or Communal (Crafting/Exploration).
4.  **Upbringing (Selects 1 Skill/Skill Group):** Academic (Lore), Creative (Music/Perform/Crafting), Labor (Blacksmithing/Handle Animals/Exploration), Lawless (Intrigue), Martial (Specific Skills related to combat/warfare), or Noble (Interpersonal).

### Step 4: Choose Career

Select one profession the hero held before adventuring, granting specialized skills and resources.

| Career (17 Choices) | Core Mechanical Grants | Skills Gained (Total) |
| :--- | :--- | :--- |
| **Agent** | 2 Languages | Sneak, 1 Interpersonal, 1 Intrigue (3) |
| **Aristocrat** | 1 Language, **+1 Renown, +1 Wealth** | 1 Interpersonal, 1 Lore (2) |
| **Artisan** | 1 Language, **240 Project Points** | 2 Crafting (2) |
| **Beggar** | 2 Languages | Rumors, 1 Exploration, 1 Interpersonal (3) |
| **Criminal** | 1 Language, **120 Project Points** | Criminal Underworld, 2 Intrigue (3) |
| **Disciple** | **240 Project Points** | Religion, 2 Lore (3) |
| **Explorer** | 2 Languages | Navigate, 2 Exploration (3) |
| **Farmer** | 1 Language, **120 Project Points** | Handle Animals, 2 Exploration (3) |
| **Gladiator** | 1 Language, **+2 Renown** | 2 Exploration (2) |
| **Laborer** | 1 Language, **120 Project Points** | Endurance, 2 Crafting OR 2 Exploration (3) |
| **Mage’s Apprentice** | 1 Language, **+1 Renown** | Magic, 2 Lore (3) |
| **Performer** | **+2 Renown** | Music/Perform, 2 Interpersonal (3) |
| **Politician** | 1 Language, **+1 Renown, +1 Wealth** | 2 Interpersonal (2) |
| **Sage** | 1 Language, **240 Project Points** | 2 Lore (2) |
| **Sailor** | 2 Languages | Swim, 2 Exploration (3) |
| **Soldier** | 2 Languages, **+1 Renown** | 1 Exploration, 1 Intrigue (2) |
| **Warden** | 1 Language, **120 Project Points** | Nature, 1 Exploration, 1 Intrigue (3) |
| **Watch Officer** | 2 Languages | Alertness, 2 Intrigue (3) |
| **Perk:** All careers grant one Perk type corresponding to the job (e.g., Artisan grants a Crafting Perk). |

### Step 5: Choose Class

Select one class, which determines starting stats, resources, core abilities, and unique subclass features.

| Class (9 Choices) | Starting Characteristics (Base Array) | Starting Stamina / Recoveries | Core Resources & Features | Subclass Choices |
| :--- | :--- | :--- | :--- | :--- |
| **Censor** | M2, P2 | 21 / 12 | **Wrath**, Judgment, My Life for Yours, Domain Feature (from 1 Domain) | Order (Exorcist, Oracle, Paragon), Domain (4 choices per Deity) |
| **Conduit** | I2 | 18 / 8 | **Piety**, Healing Grace, Ray of Wrath, Prayer, Conduit Ward, Domain Features (from 2 Domains) | 2 Domains (4 choices per Deity) |
| **Elementalist** | R2 | 18 / 8 | **Essence**, Hurl Element, Practical Magic, Specialization Triggered Action, Enchantment, Elementalist Ward | Specialization (Earth, Fire, Green, Void) |
| **Fury** | M2, A2 | 21 / 10 | **Ferocity**, Growing Ferocity, Mighty Leaps, Aspect Features, Aspect Triggered Action | Aspect (Berserker, Reaver, Stormwight) |
| **Null** | A2, I2 | 21 / 8 | **Discipline**, Null Field, Inertial Shield, Discipline Mastery, Null Speed, Psionic Augmentation, Psionic Martial Arts | Tradition (Chronokinetic, Cryokinetic, Metakinetic) |
| **Shadow** | A2 | 18 / 8 | **Insight**, Hesitation Is Weakness, College Features, College Triggered Action, Kit | College (Black Ash, Caustic Alchemy, Harlequin Mask) |
| **Tactician** | M2, R2 | 21 / 10 | **Focus**, Doctrine Feature, Doctrine Triggered Action, Field Arsenal, Mark, Strike Now | Doctrine (Insurgent, Mastermind, Vanguard) |
| **Talent** | R2, P2 | 18 / 8 | **Clarity/Strain**, Mind Spike, Psionic Augmentation, Talent Ward, Telepathic Speech, Tradition Features | Tradition (Chronopathy, Telekinesis, Telepathy) |
| **Troubadour** | A2, P2 | 18 / 8 | **Drama**, Routines, Scene Partner, Class Act Features, Class Act Triggered Action | Class Act (Auteur, Duelist, Virtuoso) |

### Step 6: Determine Starting Resources and Abilities

1.  **Characteristics:** Set initial scores for Might, Agility, Reason, Intuition, and Presence. Base values are dictated by the chosen Class (Step 5) and modified by Ancestry (Step 2). Scores range from -5 to +5.
2.  **Health Resources:** Starting Stamina and Recoveries are set by Class. Calculate **Recovery Value**, which is one-third of Maximum Stamina, rounded down.
3.  **Core Abilities:** All characters gain basic combat resolution tools:
    *   **Power Roll:** Uses 2d10 + Characteristic score to achieve Tier 1 (≤11), Tier 2 (12-16), or Tier 3 (≥17) outcomes.
    *   **Edges/Banes:** Situational bonuses (+2) or penalties (-2) applied to Power Rolls.
    *   **Action Economy:** Characters take a Move Action, a Maneuver, and a Main Action per turn.
4.  **Skills:** Compile all skills gained from Culture, Career, and Class. Skills grant a +2 bonus to applicable Tests.

### Step 7: Choose Kits / Free Strikes

1.  **Kits:** Determine if the Class grants a Kit, or grants the ability to use Kits (e.g., Censor gains Kit; Elementalist gains the ability to use light armor/weapons via Enchantment of Battle). Kits grant bonuses to Stamina/Speed/Damage/Distance.
    *   *Note:* Classes without inherent weapon focus (Conduit, Elementalist, Null, Shadow, Talent) may require selecting specific subclass features or Perks to gain Kit access.
2.  **Free Strikes:** All heroes have a basic Melee Weapon Free Strike and a Ranged Weapon Free Strike (base damage: Tier 1: 2+Char, Tier 2: 4/5+Char, Tier 3: 6/7+Char).

### Step 8: Complications (Optional)

A hero may choose one Complication (such as Amnesia or Infernal Contract) that grants both a rules benefit and a thematic drawback.

### Steps 9 & 10: Finalizing Details

Finalize narrative elements (Name, appearance, personality) and establish relationships (Connections) with other party members.