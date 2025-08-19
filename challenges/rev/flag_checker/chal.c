#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <stdbool.h>

#define FLAG_LEN 8

const uint32_t P = 4294967087;
const uint32_t test_pt[8] = {577090037,2444712010,3639700191,3445702192,3280387012,271041745,1095513148,506456969};
const uint32_t test_ct[8] = {3695492958,1526668524,3790189762,20093842,2409408810,239453620,1615481745,1887562585};
const uint32_t flag_enc[8] = {605589777,4254394693,463430822,2146232739,4230614750,1466883317,31739036,1703606160};

uint64_t F(int64_t b, int64_t e, int64_t m) {
    uint64_t res = 1;
    uint64_t base = b % m;

    while (e > 0) {
        if (e & 1) {
            res = (res * base) % m;
        }
        base = (base * base) % m;
        e >>= 1;
    }

    return res;
}

void get_input(uint32_t *input) {
    for (int i = 0; i < FLAG_LEN; i++) {
        printf("> ");
        scanf("%u", &input[i]);
    }
    for (int i = 0; i < FLAG_LEN; i++) {
        input[i] %= P;
    }
}

bool check_input(uint32_t *input) {
    for (int i = 0; i < FLAG_LEN; i++) {
        uint32_t computed = F(test_pt[i], input[i], P);
        if (computed != test_ct[i]) {
            return false;
        }
    }
    return true;
}

void print_flag(uint32_t *input) {
    uint32_t out[12];
    for (int i = 0; i < FLAG_LEN; i++) {
        out[i] = F(flag_enc[i], input[i], P);
    }
	printf("sigpwny{%s}", (unsigned char *)&out);
}

int main() {
    uint32_t input[FLAG_LEN];

    get_input(input);

    if (check_input(input)) {
        printf("PRINTING FLAG: \n");
        print_flag(input);
    }
}

