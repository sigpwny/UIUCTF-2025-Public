#!/usr/bin/env python3
import sys
from PIL import Image
import textwrap
import random

def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <image-file>", file=sys.stderr)
        sys.exit(1)

    img_path = sys.argv[1]
    img = Image.open(img_path).convert("RGB")
    width, height = img.size
    pixels = list(img.getdata())


    fbuf2 = ""

    # Emit C preamble
    print(textwrap.dedent(f"""\
        #include <stdio.h>
        #include "platform.h"
        #include "xil_printf.h"
        #include "xaxivdma.h"
        #include "xparameters.h"
        #include "sleep.h"
        #include <stdlib.h>

        #define WIDTH      800U         // Frame width in pixels
        #define HEIGHT     600U         // Frame height in pixels
        //#define WIDTH	640U
        //#define HEIGHT	480U
        //volatile uint32_t *fbuf = (void *)0x82000000;
        //volatile uint32_t *fbuf2 = (void *)0x82690000;

        int main()
        {{
            init_platform();
            XAxiVdma InstancePtr;
            XAxiVdma_Config *Config;
            int Status = XST_SUCCESS;
            Config = XAxiVdma_LookupConfig(XPAR_AXIVDMA_0_DEVICE_ID);
            if(!Config){{
                //print("Config acquire failed");
                exit(0);
            }}

            Status = XAxiVdma_CfgInitialize(&InstancePtr, Config, Config->BaseAddress);
            if(Status != XST_SUCCESS){{
                //print("cfg_init failed");
                exit(0);
            }}

            u32 stride = WIDTH * (Config->Mm2SStreamWidth>>3); //this is actually very important and if this is wrong DMA will not work. Spent like 3 hours here.
            xil_printf("%d",stride);
            XAxiVdma_DmaSetup params = {{
            .VertSizeInput = HEIGHT,
            .HoriSizeInput = stride,
            .Stride = stride,
            .FrameDelay = 0,
            .EnableCircularBuf = 1,
            .EnableSync = 0,
            .EnableFrameCounter = 0,
            .FixedFrameStoreAddr = 0
            }};


            Status = XAxiVdma_DmaConfig(&InstancePtr, XAXIVDMA_READ, &params);
            if(Status != XST_SUCCESS){{
                //print("DMA config failed");
                exit(0);
            }}

            Status = XAxiVdma_DmaSetBufferAddr(&InstancePtr, XAXIVDMA_READ,
                                    (UINTPTR[]){{0x82000000,0x82269000}});
            if(Status != XST_SUCCESS){{
                //print("DMA set buffer addr failed");
                exit(0);
            }}
            Status = XAxiVdma_DmaStart(&InstancePtr, XAXIVDMA_READ);
            if(Status != XST_SUCCESS){{
                //print("DMA start failed");
                exit(0);
            }}
            //print("DMA started");
            XAxiVdma_StartParking(&InstancePtr,0,XAXIVDMA_READ);
                          
            
    """))

    pixels1 = [0 for _ in range(len(pixels))]
    pixels2 = [0 for _ in range(len(pixels))]

    for y in range(height):
        row_start = y * width
        x = 0
        while x < width:
            idx = row_start + x
            r, g, b = pixels[idx]
            #orig_color = (r << 16) | (g << 8) | b
            r_range = r * 2
            g_range = g * 2
            b_range = b * 2
            
            if x % 16 < random.randint(3,12):
                if r_range > 0xFF:
                    r1 = 0xFF
                else:
                    r1 = random.randint(0, r_range // 2)
                r2 = r_range - r1

                if g_range > 0xFF:
                    g1 = g_range - 0xFF
                else:
                    g1 = random.randint(g_range // 2, g_range)
                g2 = g_range - g1

                b1 = random.randint(0, b_range // 3)
                b2 = b_range - b1
                if b2 > 0xFF:
                    b1 += b2 - 0xFF
                    b2 = 0xFF
            else:
                r1 = random.randint(r_range // 3, r_range)
                r2 = r_range - r1
                if r2 > 0xFF:
                    r1 += r2 - 0xFF
                    r2 = 0xFF
                elif r1 > 0xFF:
                    r2 += r1 - 0xFF
                    r1 = 0xFF
                
                if g_range > 0xFF:
                    g1 = g_range - 0xFF
                else:
                    g1 = random.randint(0, g_range // 3)
                g2 = g_range - g1

                b1 = random.randint(0, b_range)
                if b1 > 0xFF:
                    b1 = b_range - 0xFF
                b2 = b_range - b1
            
            if y % 16 < random.randint(3,12):
                r1, r2 = r2, r1
                g1, g2 = g2, g1
                b1, b2 = b2, b1

            #random_1 = random.randint(0,0xFF)
            #random_2 = random.randint(0,0xFF)
            color_1 = (r1 << 16) | (g1 << 8) | b1 
            color_2 = (r2 << 16) | (g2 << 8) | b2

            pixels1[idx] = (r1, g1, b1)
            pixels2[idx] = (r2, g2, b2)

            addr_fbuf = 0x82000000 + 4*idx
            fbuf_final = addr_fbuf
            addr_fbuf2 = 0x82269000 + 4*idx
            fbuf2_final = addr_fbuf2
            # print(f"    *((uint32_t *){addr_fbuf2}) = 0x{color_1:06X};  // ({r:3d},{g:3d},{b:3d})")
            fbuf2 += f"    *((uint32_t *){addr_fbuf2}) = 0x{color_1:06X};  // ({r:3d},{g:3d},{b:3d})\n"
            print(f"    *((uint32_t *){addr_fbuf}) = 0x{color_2:06X};  // ({r:3d},{g:3d},{b:3d})")
            x += 1

    for i in range(fbuf_final+4, 0x82269000, 4):
        random_data = random.randint(0, 0xFFFFFFFF)
        print(f"    *((uint32_t *){i}) = {random_data};")
    print(fbuf2)

    for i in range(fbuf2_final+4, 0x82300000,4):
        random_data = random.randint(0,0xFFFFFFFF)
        print(f"    *((uint32_t *){i}) = {random_data};")

    print(textwrap.dedent("""
    while(1){
    XAxiVdma_StartParking(&InstancePtr,0,XAXIVDMA_READ);    
    sleep(1);                  
    XAxiVdma_StartParking(&InstancePtr,1,XAXIVDMA_READ);
    sleep(1);         
                          
                          }
    }\n"""))

    img1 = Image.new("RGB", (width, height))
    img2 = Image.new("RGB", (width, height))
    img1.putdata(pixels1)
    img2.putdata(pixels2)
    img1.save("fbuf1.png")
    img2.save("fbuf2.png")

if __name__ == "__main__":
    main()
