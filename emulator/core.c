// Every Bit browser bridge. The emulated hardware is floooh/chips (zlib).
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <string.h>
#define CHIPS_ASSERT(c) do { if (!(c)) __builtin_trap(); } while (0)
#define assert(c) CHIPS_ASSERT(c)
#define CHIPS_IMPL
#include "vendor/chips_common.h"
#include "vendor/m6502.h"
#include "vendor/m6522.h"
#include "vendor/m6561.h"
#include "vendor/kbd.h"
#include "vendor/mem.h"
#include "vendor/clk.h"
#include "vendor/c1530.h"
#include "vendor/vic20.h"
#define EXPORTED __attribute__((visibility("default")))
static vic20_t machine;
static uint8_t roms[20480];
static uint8_t transfer[65536];
static float samples[8192];
static int samples_count;
static uint32_t frame[232 * 272];
static uint8_t ramview[65536];
static void audio_ready(const float* data, int count, void* unused) {
    (void)unused;
    for (int i=0; i<count && samples_count<8192; i++) samples[samples_count++]=data[i];
}
EXPORTED uint8_t* rom_ptr(void) { return roms; }
EXPORTED uint8_t* transfer_ptr(void) { return transfer; }
EXPORTED void init_machine(int expanded) {
    samples_count=0;
    vic20_init(&machine,&(vic20_desc_t){
        .mem_config=expanded?VIC20_MEMCONFIG_24K:VIC20_MEMCONFIG_STANDARD,
        .c1530_enabled=false,
        .audio={.callback={.func=audio_ready},.sample_rate=44100,.num_samples=128,.volume=0.35f},
        .roms={.chars={roms,4096},.basic={roms+4096,8192},.kernal={roms+12288,8192}}
    });
}
EXPORTED void exec_us(uint32_t us) { vic20_exec(&machine,us>40000?40000:us); }
EXPORTED void key_down(int key) { vic20_key_down(&machine,key); }
EXPORTED void key_up(int key) { vic20_key_up(&machine,key); }
EXPORTED void release_keys(void) { for(int i=0;i<256;i++)vic20_key_up(&machine,i); }
EXPORTED void joystick(int mask) { vic20_joystick(&machine,(uint8_t)mask); }
EXPORTED int peek(int address) {
    uint16_t a=(uint16_t)address;
    if(a>=0x9000&&a<=0x900F) return machine.vic.regs[a&15];
    return mem_rd(&machine.mem_cpu,a);
}
EXPORTED void poke_ram(int address,int value) { mem_wr(&machine.mem_cpu,(uint16_t)address,(uint8_t)value); }
EXPORTED int cpu_pc(void) { return m6502_pc(&machine.cpu); }
EXPORTED uint8_t* memory_view(void) { for(int a=0;a<65536;a++)ramview[a]=(uint8_t)peek(a);return ramview; }
EXPORTED uint32_t* render_frame(void) {
    const uint32_t* palette=(const uint32_t*)m6561_palette().ptr;
    for(int y=0;y<272;y++)for(int x=0;x<232;x++)frame[y*232+x]=palette[machine.fb[y*512+x]&15];
    return frame;
}
EXPORTED float* audio_ptr(void) { return samples; }
EXPORTED int audio_count(void) { return samples_count; }
EXPORTED void audio_clear(void) { samples_count=0; }
// Injection feeds the ROM's input buffer, never parses BASIC on the host.
EXPORTED int type_character(int c) {
    if(mem_rd(&machine.mem_cpu,198)!=0)return 0;
    mem_wr(&machine.mem_cpu,631,(uint8_t)c);mem_wr(&machine.mem_cpu,198,1);return 1;
}
// Only raw RAM payloads are loaded. BASIC pointer fix-up belongs to the host adapter.
EXPORTED int load_prg(int length) {
    if(length<3||length>65536)return 0;
    unsigned start=transfer[0]|(transfer[1]<<8);
    if(start+(unsigned)length-2>65536)return 0;
    return vic20_quickload(&machine,(chips_range_t){transfer,(size_t)length});
}
