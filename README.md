<!-- omit in toc -->
# esdmr's 8 bit CPU

> I don't even know if you can call this a "CPU". ~esdmr

Turing-complete 8 bit cpu with custom instruction set.

<!-- omit in toc -->
## Table of contents

- [Specification](#specification)
  - [Registers](#registers)
  - [Memory Layout](#memory-layout)
  - [Instructions](#instructions)
  - [Components](#components)
    - [Controller](#controller)
    - [Memory](#memory)
    - [Printer](#printer)

## Specification

### Registers

- There are 8, 8bit Registers.
  1. `A`: General purpose
  2. `B`: General purpose
  3. `X`: General purpose
  4. `Y`: General purpose
  5. `IP`: Instruction pointer
  6. `SP`: Stack pointer (6 bits only)
  7. `BP`:  Bank pointer
  8. `FLG`: Flag register
     1. `1000'0000`: Negative (N)
     2. `0100'0000`: Zero (Z)
     3. `0010'0000`: Overflow (V)
     4. `0001'0000`: Carry (C)
- Only the general purpose registers can be directly read or written.
- Registers `A` and `B` can be used to read and write `SP` and `BP` registers.
- Registers `X` and `Y` are operands in logical or arithmetic operations.
- An additional 2 bytes of storage exists to cache the instruction being read. However it is impossible to read or write this storage.
- `BP` can also be written to with the `bnk#` instruction.
- Initial value of registers are undefined. `IP` is always initialized to `80`.

### Memory Layout

- Addresses `00` - `7f` are passed via bus to the components.
- `BP` can be used to switch the component list of `00` - `7f`.
  - This allows for a total of 8 + 7 bits of address space.
- Along with the BUS, the CPU has 128 bytes of internal memory at `80` - `ff`.
  - This space is static and `BP` will not change its contents.
- Any Component can be placed anywhere. To place a component, assembly `.init` or custom js/ts code can be used.
- CPU always starts at `80`.
- `c0` - `ff` is the stack range. SP will never overflow outside of this range.

### Instructions

- Table of Instructions can be viewed here: [cpu/instructions.md](./cpu/instructions.md)
- Instructions can be identified by the following categories:
  - `imp`: Implied. Does not accept a parameter.
  - `imd`: Immediate. Accepts a immediate value. (8 bits)
  - `ptr`: Indirect. Accepts a pointer to a memory location. (8 bits)
- Instructions may be overloaded to multiple categories.
  - Example: `ld` is `imd` and `ptr`.
- OPCodes' size is 1 byte.
- Undefined opcodes will halt the cpu. (resumable)

### Components

#### Controller

Used by other components for interrupts and registers.

Config: number — Bank to enable the controller.

#### Memory

General purpose storage. Used by assembler.

Config:

- `bank`: number — Bank to enable the memory.
- `readonly`: boolean ?? `false` — Is memory readonly.
- (`buffer`: `Uint8Array` — Used by assembler)

#### Printer

Generic output device. Outputs content of internal memory bank as ASCII, Zero terminated. Requires controller.

Config:

- `bank`: number — Bank to enable the internal memory.
- `addr`: number — Address to enable interrupt in controller.
