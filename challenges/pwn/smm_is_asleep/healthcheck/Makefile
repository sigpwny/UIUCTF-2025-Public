obj-m += solution.o

all:
	make -C /usr/src/linux-headers M=$(shell pwd) modules

clean:
	make -C /usr/src/linux-headers M=$(shell pwd) clean
