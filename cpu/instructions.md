# Instructions

|   0    |   1    |   2    |    3    |   4    |   5    |   6   |    7    |   8    |   9    |   A    |   B    |   C   |   D   |   E   |   F   |
| :----: | :----: | :----: | :-----: | :----: | :----: | :---: | :-----: | :----: | :----: | :----: | :----: | :---: | :---: | :---: | :---: |
| `BRK`  | `NOP`  | `BNK#` | `(DBG)` | `JMP*` | `JSR*` | `RTS` | `(RTI)` | `ADD`  | `SUB`  | `NTX`  | `NTY`  | `ROL` | `RLC` | `SHL` | `EOR` |
| `ADD`  | `SUB`  |        |         | `JPA`  | `JPB`  | `JPX` |  `JPY`  | `AND`  | `IOR`  | `TNX`  | `TNY`  | `ROR` | `RRC` | `SHR` | `ASR` |
|        |        |        |         |        |        |       |         |        |        |        |        |       |       |       |       |
|        |        |        |         |        |        |       |         |        |        |        |        |       |       |       |       |
| `BPL*` | `BCV*` | `BCC*` | `BNQ*`  |        |        |       |         | `CLN`  | `CLV`  | `CLC`  | `CLZ`  |       |       |       |       |
| `BMI*` | `BVS*` | `BCS*` | `BEQ*`  |        |        |       |         | `SEN`  | `SEV`  | `SEC`  | `SEZ`  |       |       |       |       |
|        |        |        |         |        |        |       |         |        |        |        |        |       |       |       |       |
|        |        |        |         |        |        |       |         |        |        |        |        |       |       |       |       |
| `INA`  | `INB`  | `INX`  |  `INY`  | `PHA`  | `PHB`  | `PHX` |  `PHY`  | `LDA*` | `LDB*` | `LDX*` | `LDY*` | `LZA` | `LZB` | `LZX` | `LZY` |
| `DCA`  | `DCB`  | `DCX`  |  `DCY`  | `PLA`  | `PLB`  | `PLX` |  `PLY`  | `STA*` | `STB*` | `STX*` | `STY*` | `LOA` | `LOB` | `LOX` | `LOY` |
| `LSA`  | `LSB`  | `LBA`  |  `LBB`  |        |        |       |         | `LDA#` | `LDB#` | `LDX#` | `LDY#` |       |       |       |       |
| `SSA`  | `SSB`  | `SBA`  |  `SBB`  |        |        |       |         | `CPA#` | `CPB#` | `CPX#` | `CPY#` |       |       |       |       |
| `TAA`  | `TAB`  | `TAX`  |  `TAY`  | `LAA`  | `LAB`  | `LAX` |  `LAY`  | `CAA`  | `CAB`  | `CAX`  | `CAY`  | `SAA` | `SAB` | `SAX` | `SAY` |
| `TBA`  | `TBB`  | `TBX`  |  `TBY`  | `LBA`  | `LBB`  | `LBX` |  `LBY`  | `CBA`  | `CBB`  | `CBX`  | `CBY`  | `SBA` | `SBB` | `SBX` | `SBY` |
| `TXA`  | `TXB`  | `TXX`  |  `TXY`  | `LXA`  | `LXB`  | `LXX` |  `LXY`  | `CXA`  | `CXB`  | `CXX`  | `CXY`  | `SXA` | `SXB` | `SXX` | `SXY` |
| `TYA`  | `TYB`  | `TYX`  |  `TYY`  | `LYA`  | `LYB`  | `LYX` |  `LYY`  | `CYA`  | `CYB`  | `CYX`  | `CYY`  | `SYA` | `SYB` | `SYX` | `SYY` |
