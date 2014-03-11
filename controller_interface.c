#include <linux/input.h>
#include <linux/uinput.h>
#include <stdio.h>
#include <getopt.h>
#include <assert.h>
#include <stdint.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <fcntl.h>
#include <errno.h>

#define MAX_BTN 12
#define MAX_STR_LEN 20



struct gamepad_t {
int fd;
struct uinput_user_dev uidev;
char buttonMap[MAX_BTN][MAX_STR_LEN];
};

void gamepad_config(struct gamepad_t *players);
void gamepad_create(struct gamepad_t *players);
void gamepad_remove(struct gamepad_t *players);
void gamepad_btn_press(struct gamepad_t *players);
void gamepad_btn_release(struct gamepad_t *players);
void gamepad_joystick_event(struct gamepad_t *players);

//for debugging
char *button_map_read(struct gamepad_t *players, int player, int index);





int main() {

struct gamepad_t players[4];
//initialize all values
int i=0, j=0;
for (i=0; i<4; i++) {
players[i].fd = 0;
for (j=0; j<MAX_BTN; j++) {
strcpy(players[i].buttonMap[j], "");
}
}



char temp[MAX_STR_LEN];

printf("Gamepad emulator booting up!\n"); 

while(1) {
//printf("In the while loop.\n");
scanf("%s",temp);

//printf("You entered: %s.\n", temp);

if (!strcmp(temp, "config")) {
//do config for a button mapping for a specified gamepad id
gamepad_config(players);
}
else if (!strcmp(temp, "create")) {
//create a new gamepad in the array index specified by user id
gamepad_create(players);
}
else if (!strcmp(temp, "remove")) {
//remove the specified gamepad id.
//if all are removed, exit this while loop
gamepad_remove(players);
}
else if (!strcmp(temp, "btn_press")) {
//button press event
gamepad_btn_press(players);
}
else if (!strcmp(temp, "btn_release")) {
//button release event
gamepad_btn_release(players);
}
else if (!strcmp(temp, "joystick_event")) {
//joystick event. Add this later
gamepad_joystick_event(players);
}
else {
fprintf(stderr, "Unrecognized input\n");
exit(-1);
}
}

printf("Gamepad emulator ending.\n");

}





void gamepad_config(struct gamepad_t *players) {
int player_id=0, button_id=0;
char btn_map[MAX_STR_LEN];
char temp[MAX_STR_LEN];

scanf("%s",temp); //read in the player id
player_id = atoi(temp);
if (player_id < 0 || player_id > 3) {
fprintf(stderr, "Player id out of range\n");
exit(-1);
}

scanf("%s", temp); //read in the button_id
button_id = atoi(temp);
if (button_id < 0 || button_id >= MAX_BTN) {
fprintf(stderr, "Button id out of range\n");
exit(-1);
}

scanf("%s", temp); //read in the button_mapping
strcpy (btn_map, temp);

strcpy(players[player_id].buttonMap[button_id], btn_map);

//printf("From global perspective, it was mapped as: %s\n", button_map_read(players, player_id, button_id));

}





void gamepad_create(struct gamepad_t *players) {
printf("Made it to gamepad_create\n");
int i=0;
char temp[MAX_STR_LEN];
scanf("%s",temp); //read in the player id
int player_id = atoi(temp);

memset(&(players[player_id].uidev), 0, sizeof(players[player_id].uidev));
const char *uinput_name = "ugs_0";
//uinput_name[4] += player_id;
snprintf(players[player_id].uidev.name, UINPUT_MAX_NAME_SIZE, "test");

printf("Made it past the snprintf\n");

players[player_id].uidev.id.bustype = BUS_USB;
players[player_id].uidev.id.vendor = 0x1; //does this matter?
players[player_id].uidev.id.product = 0x2; //does this matter?
players[player_id].uidev.id.version = 1;

players[player_id].fd = open("/dev/uinput", O_WRONLY | O_NONBLOCK);
int ret = ioctl(players[player_id].fd, UI_SET_EVBIT, EV_KEY);
ret = ioctl(players[player_id].fd, UI_SET_EVBIT, EV_SYN);
for (i=0; i<MAX_BTN; i++) {
if (players[player_id].buttonMap[i] != "") {
//big giant if-else block for ev.code
int key_code;
if (!strcmp(players[player_id].buttonMap[i], "BTN_A")) {
key_code = BTN_A;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_B")) {
key_code = BTN_B;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_SELECT")) {
key_code = BTN_SELECT;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_START")) {
key_code = BTN_START;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_LEFT")) {
key_code = BTN_LEFT;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_RIGHT")) {
key_code = BTN_RIGHT;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_FORWARD")) {
key_code = BTN_FORWARD;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_BACK")) {
key_code = BTN_BACK;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_X")) {
key_code = BTN_X;
}
else if (!strcmp(players[player_id].buttonMap[i], "BTN_Y")) {
key_code = BTN_Y;
}

ret = ioctl(players[player_id].fd, UI_SET_KEYBIT, key_code);
printf("Registering buttonType: %s for player #%d\n", players[player_id].buttonMap[i], player_id);
}

else {
printf("button id %d is unused for player #%d\n", i, player_id);
}
}

ret = write(players[player_id].fd, &(players[player_id].uidev), sizeof(players[player_id].uidev));
if (ret < 0) {
printf("We have a problem 1\n");
}
ret = ioctl(players[player_id].fd, UI_DEV_CREATE);
if (ret<0) {
printf("We have a problem 2\n");
}

}




void gamepad_remove(struct gamepad_t *players) {
char temp[MAX_STR_LEN];
scanf("%s",temp); //read in the player id
int player_id = atoi(temp);

printf("Destroying player #%d's gamepad.\n", player_id);
int ret = ioctl(players[player_id].fd, UI_DEV_DESTROY);
close(players[player_id].fd);

}




void gamepad_btn_press(struct gamepad_t *players) {

char temp[MAX_STR_LEN];
scanf("%s",temp); //read in the player id
int player_id = atoi(temp);
scanf("%s", temp); //read in the button_id
int button_id = atoi(temp);

struct input_event ev;
memset(&ev, 0, sizeof(struct input_event));
ev.type = EV_KEY;
//big giant if-else block for ev.code
if (!strcmp(players[player_id].buttonMap[button_id], "BTN_A")) {
ev.code = BTN_A;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_B")) {
ev.code = BTN_B;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_SELECT")) {
ev.code = BTN_SELECT;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_START")) {
ev.code = BTN_START;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_LEFT")) {
ev.code = BTN_LEFT;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_RIGHT")) {
ev.code = BTN_RIGHT;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_FORWARD")) {
ev.code = BTN_FORWARD;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_BACK")) {
ev.code = BTN_BACK;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_X")) {
ev.code = BTN_X;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_Y")) {
ev.code = BTN_Y;
}
else {
// *************************
// *************************
// *************************
//add this functionality later
// *************************
// *************************
// *************************
printf("We didn't have that button mapped...\n");
exit(-1);
}

ev.value = 1; //represents a button press

int ret = write(players[player_id].fd, &ev, sizeof(struct input_event));

memset(&ev, 0, sizeof(struct input_event));
   ev.type = EV_SYN;
   ev.code = 0;
   ev.value = 0;

   write(players[player_id].fd, &ev, sizeof(struct input_event));
}

void gamepad_btn_release(struct gamepad_t *players) {
char temp[MAX_STR_LEN];
scanf("%s",temp); //read in the player id
int player_id = atoi(temp);
scanf("%s", temp); //read in the button_id
int button_id = atoi(temp);

struct input_event ev;
memset(&ev, 0, sizeof(ev));
ev.type = EV_KEY;
//big giant if-else block for ev.code
if (!strcmp(players[player_id].buttonMap[button_id], "BTN_A")) {
ev.code = BTN_A;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_B")) {
ev.code = BTN_B;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_SELECT")) {
ev.code = BTN_SELECT;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_START")) {
ev.code = BTN_START;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_LEFT")) {
ev.code = BTN_LEFT;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_RIGHT")) {
ev.code = BTN_RIGHT;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_FORWARD")) {
ev.code = BTN_FORWARD;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_BACK")) {
ev.code = BTN_BACK;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_X")) {
ev.code = BTN_X;
}
else if (!strcmp(players[player_id].buttonMap[button_id], "BTN_Y")) {
ev.code = BTN_Y;
}
else {
// *************************
// *************************
// *************************
//add this functionality later
// *************************
// *************************
// *************************
printf("We didn't have that button mapped...\n");
exit(-1);
}

ev.value = 0; //represents a button release

int ret = write(players[player_id].fd, &ev, sizeof(ev));

memset(&ev, 0, sizeof(struct input_event));
   ev.type = EV_SYN;
   ev.code = 0;
   ev.value = 0;

   write(players[player_id].fd, &ev, sizeof(struct input_event));
}




void gamepad_joystick_event(struct gamepad_t *players) {
// *************************
// *************************
// *************************
//add this functionality later
// *************************
// *************************
// *************************
}




//for debugging
char *button_map_read(struct gamepad_t *players, int player, int index) {
return players[player].buttonMap[index];
}
