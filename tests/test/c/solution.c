#include <stdio.h>

int main() {

	char *line = NULL;
	size_t len = 0;
	int length;

	if ((length = getline(&line, &len, stdin)) == -1) {
		return 1;
	}

	printf("%s", line);

	return 0;
}
