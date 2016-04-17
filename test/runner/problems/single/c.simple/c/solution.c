#include <stdio.h>
int main() {
	char *line = NULL;
	size_t len = 0;
	int length = getline(&line, &len, stdin);
	printf("%s", line);
	return 0;
}
