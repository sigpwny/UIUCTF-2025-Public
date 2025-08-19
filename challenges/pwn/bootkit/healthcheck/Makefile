obj-m += exploit.o

all:
	make -C linux-headers M=$(shell pwd) modules
	strip --strip-debug exploit.ko

clean:
	make -C linux-headers M=$(shell pwd) clean
