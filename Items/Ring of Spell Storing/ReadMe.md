# Module Requirements  
Midi-Qol  
DAE  
Effect Macros  
Warpgate  
# Supported Modules   
Custom Character Sheet Sections  
# Setup Instructions  
- Import "fvtt-Item-ring-of-spell-storing-(0_5).json" as an item.  
- Create a hotbar script macro from the following files:  
  - Chris-RingOfSpellStoring.js  
  - Chris-RingOfSpellStoringAttack.js  
  - Chris-RingOfSpellStoringCast.js   
# Other Notes  
Showing stored spells should be toggled off before moving a ring from one actor to another.  
Used spells should only be cleared out after any effects created from them have ended.  
Lines 50 to 59 in "Chris-RingOfSpellStoringCast.js" can be added back in if you want the spells to get auto-removed during a long rest. Not reccomended to be enabled if the actor is casting spells that need to keep their effects during a long rest.