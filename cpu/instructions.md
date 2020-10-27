# Instructions

Return to [README.md](../README.md#instructions)

Symbols:

- `#`: Immediate
- `*`: Indirect (ptr)
- `()`: Non-standard

|       |         x0         |         x1         |         x2         |         x3         |         x4         |         x5         |        x6         |        x7         |        x8         |        x9         |        xA         |        xB         |        xC         |        xD         |        xE         |        xF         |
| :---: | :----------------: | :----------------: | :----------------: | :----------------: | :----------------: | :----------------: | :---------------: | :---------------: | :---------------: | :---------------: | :---------------: | :---------------: | :---------------: | :---------------: | :---------------: | :---------------: |
|  0x   | [`brk`](#brk-imp)  | [`nop`](#nop-imp)  | [`bnk#`](#bnk-imd) |      `(dbg)`       | [`jmp*`](#jmp-ptr) | [`jsr*`](#jsr-ptr) | [`rts`](#rts-imp) |                   | [`adc`](#add-imp) | [`sbc`](#sub-imp) | [`ntx`](#nt-imp)  | [`nty`](#nt-imp)  | [`rol`](#rol-imp) | [`rlc`](#rlc-imp) | [`shl`](#shl-imp) | [`eor`](#eor-imp) |
|  1x   | [`add`](#add-imp)  | [`sub`](#sub-imp)  |                    |                    | [`jpa`](#jpa-imp)  | [`jpb`](#jpb-imp)  | [`jpx`](#jpx-imp) | [`jpy`](#jpy-imp) | [`and`](#and-imp) | [`ior`](#ior-imp) | [`tnx`](#tn-imp)  | [`tny`](#tn-imp)  | [`ror`](#ror-imp) | [`rrc`](#rrc-imp) | [`shr`](#shr-imp) | [`asr`](#asr-imp) |
|  2x   |                    |                    |                    |                    |                    |                    |                   |                   |                   |                   |                   |                   |                   |                   |                   |                   |
|  3x   |                    |                    |                    |                    |                    |                    |                   |                   |                   |                   |                   |                   |                   |                   |                   |                   |
|  4x   | [`bpl*`](#bpl-ptr) | [`bcv*`](#bcv-ptr) | [`bcc*`](#bcc-ptr) | [`bnq*`](#bnq-ptr) |                    |                    |                   |                   | [`cln`](#cln-imp) | [`clv`](#clv-imp) | [`clc`](#clc-imp) | [`clz`](#clz-imp) |                   |                   |                   |                   |
|  5x   | [`bmi*`](#bmi-ptr) | [`bvs*`](#bvs-ptr) | [`bcs*`](#bcs-ptr) | [`beq*`](#beq-ptr) |                    |                    |                   |                   | [`sen`](#sen-imp) | [`sev`](#sev-imp) | [`sec`](#sec-imp) | [`sez`](#sez-imp) |                   |                   |                   |                   |
|  6x   |                    |                    |                    |                    |                    |                    |                   |                   |                   |                   |                   |                   |                   |                   |                   |                   |
|  7x   |                    |                    |                    |                    |                    |                    |                   |                   |                   |                   |                   |                   |                   |                   |                   |                   |
|  8x   |  [`ina`](#in-imp)  |  [`inb`](#in-imp)  |  [`inx`](#in-imp)  |  [`iny`](#in-imp)  |  [`pha`](#ph-imp)  |  [`phb`](#ph-imp)  | [`phx`](#ph-imp)  | [`phy`](#ph-imp)  | [`lda*`](#ld-ptr) | [`ldb*`](#ld-ptr) | [`ldx*`](#ld-ptr) | [`ldy*`](#ld-ptr) | [`lza`](#lz-imp)  | [`lzb`](#lz-imp)  | [`lzx`](#lz-imp)  | [`lzy`](#lz-imp)  |
|  9x   |  [`dca`](#dc-imp)  |  [`dcb`](#dc-imp)  |  [`dcx`](#dc-imp)  |  [`dcy`](#dc-imp)  |  [`pla`](#pl-imp)  |  [`plb`](#pl-imp)  | [`plx`](#pl-imp)  | [`ply`](#pl-imp)  | [`sta*`](#st-ptr) | [`stb*`](#st-ptr) | [`stx*`](#st-ptr) | [`sty*`](#st-ptr) | [`loa`](#lo-imp)  | [`lob`](#lo-imp)  | [`lox`](#lo-imp)  | [`loy`](#lo-imp)  |
|  Ax   |  [`lsa`](#ls-imp)  |  [`lsb`](#ls-imp)  |  [`lba`](#lb-imp)  |  [`lbb`](#lb-imp)  |                    |                    |                   |                   | [`lda#`](#ld-imd) | [`ldb#`](#ld-imd) | [`ldx#`](#ld-imd) | [`ldy#`](#ld-imd) |                   |                   |                   |                   |
|  Bx   |  [`ssa`](#ss-imp)  |  [`ssb`](#ss-imp)  |  [`sba`](#sb-imp)  |  [`sbb`](#sb-imp)  |                    |                    |                   |                   | [`cpa#`](#cp-imd) | [`cpb#`](#cp-imd) | [`cpx#`](#cp-imd) | [`cpy#`](#cp-imd) |                   |                   |                   |                   |
|  Cx   |  [`taa`](#t-imp)   |  [`tab`](#t-imp)   |  [`tax`](#t-imp)   |  [`tay`](#t-imp)   |  [`laa`](#l-imp)   |  [`lab`](#l-imp)   |  [`lax`](#l-imp)  |  [`lay`](#l-imp)  |  [`caa`](#c-imp)  |  [`cab`](#c-imp)  |  [`cax`](#c-imp)  |  [`cay`](#c-imp)  |  [`saa`](#s-imp)  |  [`sab`](#s-imp)  |  [`sax`](#s-imp)  |  [`say`](#s-imp)  |
|  Dx   |  [`tba`](#t-imp)   |  [`tbb`](#t-imp)   |  [`tbx`](#t-imp)   |  [`tby`](#t-imp)   |  [`lba`](#l-imp)   |  [`lbb`](#l-imp)   |  [`lbx`](#l-imp)  |  [`lby`](#l-imp)  |  [`cba`](#c-imp)  |  [`cbb`](#c-imp)  |  [`cbx`](#c-imp)  |  [`cby`](#c-imp)  |  [`sba`](#s-imp)  |  [`sbb`](#s-imp)  |  [`sbx`](#s-imp)  |  [`sby`](#s-imp)  |
|  Ex   |  [`txa`](#t-imp)   |  [`txb`](#t-imp)   |  [`txx`](#t-imp)   |  [`txy`](#t-imp)   |  [`lxa`](#l-imp)   |  [`lxb`](#l-imp)   |  [`lxx`](#l-imp)  |  [`lxy`](#l-imp)  |  [`cxa`](#c-imp)  |  [`cxb`](#c-imp)  |  [`cxx`](#c-imp)  |  [`cxy`](#c-imp)  |  [`sxa`](#s-imp)  |  [`sxb`](#s-imp)  |  [`sxx`](#s-imp)  |  [`sxy`](#s-imp)  |
|  Fx   |  [`tya`](#t-imp)   |  [`tyb`](#t-imp)   |  [`tyx`](#t-imp)   |  [`tyy`](#t-imp)   |  [`lya`](#l-imp)   |  [`lyb`](#l-imp)   |  [`lyx`](#l-imp)  |  [`lyy`](#l-imp)  |  [`cya`](#c-imp)  |  [`cyb`](#c-imp)  |  [`cyx`](#c-imp)  |  [`cyy`](#c-imp)  |  [`sya`](#s-imp)  |  [`syb`](#s-imp)  |  [`syx`](#s-imp)  |  [`syy`](#s-imp)  |

## `brk` imp

Halts the cpu. Use `CPU.resume` to resume.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `nop` imp

Does nothing.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `bnk` imd

Selects bank.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | +   | -   | -   | -   | -   |

## `jmp` ptr

Unconditional jump.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `jsr` ptr

Jump to subroutine.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | +   | -   | -   | -   | -   | -   |

## `rts` imp

Return from subroutine.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | +   | -   | -   | -   | -   | -   |

## `adc` imp

Add with carry. `X + Y, C -> X, V, C`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | +   | +   |

## `sbc` imp

Subtract with carry. `X - Y, C -> X, V, C`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | +   | +   |

## `nt` imp

One's complement not. `R -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | R   | R   | -   | -   | -   | -   | -   | -   |

## `rol` imp

Rotate left. `X, Y -> X`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | -   |

## `rlc` imp

Rotate left through carry. `X, Y -> X, C`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | +   |

## `shl` imp

Shift left. `X, Y -> X`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | -   |

## `eor` imp

Bitwise exclusive or. `X, Y -> X`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | -   |

## `add` imp

Add. `X, Y -> X, V, C`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | +   | +   |

## `sub` imp

Subtract. `X, Y -> X, V, C`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | +   | +   |

## `jp` imp

Jump to register. `R -> IP`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `and` imp

Bitwise and. `X, Y -> X`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `ior` imp

Bitwise inclusive or. `X, Y -> X`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | -   |

## `tn` imp

Two's complement not. `R -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | R   | R   | -   | -   | -   | -   | -   | -   |

## `ror` imp

Rotate right. `X, Y -> X`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | -   |

## `rrc` imp

Rotate right through carry. `X, Y -> X, C`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | +   |

## `shr` imp

Shift right. `X, Y -> X`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | -   |

## `asr` imp

Arithmetic shift right. `X, Y -> X`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | +   | -   | -   | -   | -   | -   | -   | -   |

## `bpl` ptr

Branch on plus. `N-`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `bcv` ptr

Branch on overflow clear. `V-`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `bcc` ptr

Branch on carry clear. `C-`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `bnq` ptr

Branch on not equal. `Z-`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `cln` imp

Clear negative flag.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | +   | -   | -   | -   |

## `clv` imp

Clear overflow flag.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | +   | -   |

## `clc` imp

Clear carry flag.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | +   |

## `clz` imp

Clear zero flag.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | +   | -   | -   |

## `bmi` ptr

Branch on minus. `N+`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `bvs` ptr

Branch on overflow set. `V+`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `bcs` ptr

Branch on carry set. `C+`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `beq` ptr

Branch on equal. `Z+`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |

## `sen` imp

Set negative flag.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | +   | -   | -   | -   |

## `sev` imp

Set overflow flag.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | +   | -   |

## `sec` imp

Set carry flag.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | +   |

## `sez` imp

Set zero flag.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | +   | -   | -   |

## `in` imp

Increment register. `R -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `ph` imp

Push register to stack.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | +   | -   | -   | -   | -   | -   |

## `ld` ptr

Load from memory.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `lz` imp

Load zero. `0 -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `dc` imp

Decrement register. `R -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `pl` imp

Pull from stack onto register.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `st` ptr

Store onto memory.
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0   | 0   | 0   | 0   | -   | -   | -   | -   | -   | -   |

## `lo` imp

Load 255. `255 -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `ls` imp

Load `SP` onto register. `SP -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `lb` imp

Load `BP` onto register `BP -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `ld` imd

Load immediate. `*I -> R`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R   | R   | R   | R   | -   | -   | -   | -   | -   | -   |

## `ss` imp

Store register onto `SP`. `R -> SP`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | +   | -   | -   | -   | -   | -   |

## `sb` imp

Store register onto `BP`. `R -> BP`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | +   | -   | -   | -   | -   |

## `cp` imd

Compare register to immediate. `I - R -> N, Z`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | +   | +   | -   | -   |

## `t` imp

Transfer register to register. `R2 -> R1`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1  | R1  | R1  | R1  | -   | -   | -   | -   | -   | -   |

## `l` imp

Load from memory to register. `*R2 -> R1`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1  | R1  | R1  | R1  | -   | -   | -   | -   | -   | -   |

## `c` imp

Compare register to register. `R1 - R2 -> N, Z`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | +   | +   | -   | -   |

## `s` imp

Store register to memory. `R2 -> *R1`
| A   | B   | X   | Y   | SP  | BP  | N   | Z   | V   | C   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| -   | -   | -   | -   | -   | -   | -   | -   | -   | -   |
