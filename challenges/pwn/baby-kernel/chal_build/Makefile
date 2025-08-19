obj-m += vuln.o

module:
	make -C /kernel/linux-6.6.16 M=$(PWD)

clean:
	make -C /kernel/linux-6.6.16 M=$(PWD) clean
