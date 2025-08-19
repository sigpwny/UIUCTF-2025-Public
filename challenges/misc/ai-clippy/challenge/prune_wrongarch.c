// SPDX-License-Identifier: MIT
/*
 * Copyright 2025 Google LLC.
 */

#include <elf.h>
#include <fts.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

static void handle_file(char *path)
{
	unsigned char buffer[4];
	Elf64_Ehdr ehdr;
	FILE *fp;

	fp = fopen(path, "rb");
	if (!fp) {
		perror(path);
		return;
	}

	if (fread(buffer, 1, sizeof(buffer), fp) != sizeof(buffer)) {
		goto close;
	}

	if (fseek(fp, 0, SEEK_SET)) {
		perror("fseek");
		goto close;
	}

	if (!memcmp(buffer, "MZ", 2))  // PE
		goto delete;
	if (!memcmp(buffer, "\xFE\xED\xFA\xCE", 4))  // Mach-O
		goto delete;
	if (!memcmp(buffer, "\xFE\xED\xFA\xCF", 4))  // Mach-O
		goto delete;
	if (!memcmp(buffer, "\xCE\xFA\xED\xFE", 4))  // Mach-O
		goto delete;
	if (!memcmp(buffer, "\xCF\xFA\xED\xFE", 4))  // Mach-O
		goto delete;
	if (memcmp(buffer, "\x7F\x45\x4C\x46", 4))  // ELF
		goto close;

	if (fread(&ehdr, 1, sizeof(ehdr), fp) != sizeof(ehdr)) {
		perror("fread");
		goto close;
	}

	if (ehdr.e_ident[EI_CLASS] != ELFCLASS64)
		goto delete;
	if (ehdr.e_machine != EM_X86_64)
		goto delete;

close:
	fclose(fp);
	return;

delete:
	fclose(fp);
	printf("Delete: %s\n", path);
	unlink(path);
}

static int tree(char *argv[])
{
	FTS *ftsp;
	FTSENT *p, *chp;
	int fts_options = FTS_COMFOLLOW | FTS_LOGICAL | FTS_NOCHDIR;

	if ((ftsp = fts_open(argv, fts_options, NULL)) == NULL) {
		perror("fts_open");
		return -1;
	}

	chp = fts_children(ftsp, 0);
	if (!chp)
		return 0;

	while ((p = fts_read(ftsp)) != NULL) {
		switch (p->fts_info) {
		case FTS_F:
			if ((p->fts_statp->st_mode & S_IFMT) == S_IFREG)
				handle_file(p->fts_path);
			break;
		default:
			break;
		}
	}

	fts_close(ftsp);
	return 0;
}

int main(int argc, char *argv[])
{
	return tree(argv + 1);
}
