// SPDX-License-Identifier: MIT
/*
 * Copyright 2021-2025 Google LLC.
 */

#include <assert.h>
#include <fcntl.h>
#include <string.h>
#include <unistd.h>

int main(void)
{
	/* This is basically the same as
	 * $ dd if=code_new.rom of=/dev/pflash bs=4096 seek=132
	 * but it is far faster because using the write on /dev/pflash
	 * is much much slower than read
	 */

	int pflash_fd, img_fd;
	char buf_old[4096];
	char buf_new[4096];
	ssize_t res;

	pflash_fd = open("/dev/pflash", O_RDWR);
	img_fd = open("code_new.rom", O_RDWR);
	assert(pflash_fd >= 0 && img_fd >= 0);

	assert(lseek(pflash_fd, 0x84000, SEEK_SET) == 0x84000);

	for (;;) {
		res = read(img_fd, buf_new, 4096);
		if (!res)
			break;

		assert(res == 4096);
		assert(read(pflash_fd, buf_old, 4096) == 4096);

		if (memcmp(buf_new, buf_old, 4096)) {
			lseek(pflash_fd, -4096, SEEK_CUR);
			assert(write(pflash_fd, buf_new, 4096) == 4096);
		}
	}

	return 0;
}
