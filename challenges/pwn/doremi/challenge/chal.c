#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <stdbool.h>

void create();
void update();
void delete();
void look();
unsigned int get_index();


#define NOTE_COUNT 16
#define NOTE_SIZE  128

char * notes [NOTE_COUNT] = {0};

#define INTRO "\
###################################\n\
# Yet Another Heap Note Challenge #\n\
###################################\n\
    What Would You Like to Do:     \n\
        1. Create a Note           \n\
        2. Delete a Note           \n\
        3. Read a Note             \n\
        4. Update a Note           \n\
        5. Exit                    \n"
#define PMT "YAHNC> "



int main() {
    setvbuf(stdout, NULL, _IONBF, 0);
    setvbuf(stderr, NULL, _IONBF, 0);
    setvbuf(stdin, NULL, _IONBF, 0);
    printf(INTRO);

    while (true) {
        unsigned int option;
        printf(PMT);
        if (scanf(" %u", &option) != 1){
            printf("Invalid Input.\n");
            exit(1);
        }
        if (option >= 6 || option == 0) {
            printf("Invalid Range.\n");
            exit(1);
        }

        switch(option) {
            case 1: 
                create();
                break;
            case 2: 
                delete();
                break;
            case 3:
                look();
                break;
            case 4:
                update();
                break;
            case 5:
                exit(0);
        }
    }
    return 0;
}

unsigned int get_index() {
    unsigned int number;
    printf("Position? (0-15): ");
    if (scanf(" %u", &number) != 1){
        printf("Invalid Input.\n");
        exit(1);
    }
    if (number >= 16) {
        printf("Invalid Range.\n");
        exit(1);
    }
    return number;
}

void create() {
    unsigned int number = get_index();
    notes[number] = malloc(128);
    printf("Done!\n");
    return;
}

void look() {
    unsigned int number = get_index();
    write(STDOUT_FILENO, notes[number], NOTE_SIZE-1);
    printf("\n");
    printf("Done!\n");
}

void delete() {
   unsigned int number = get_index();
   free(notes[number]);
   printf("Done!\n");
   return; 
}

void update() {
    unsigned int number = get_index();
    printf("Content? (127 max): ");
    read(STDIN_FILENO, notes[number], NOTE_SIZE-1);
    printf("Done!\n");
    return;
}