# ft_transcendence_final

## Objective
* This project is to create a website that allows users to play the pong game against each other and to chat
## Credits
* This project is done by 3 school 42 students: Vlageard, Tvanbesi & Hzhou

## Tech stack
* Programming language: Typescript
* Backend: Nestjs
* Frontend: Angular
* Database: PostgreSQL

## Project main requirements
### Security concern
* Any stored password must be hashed
* The server-side must have sanitization on forms and any other user input.
### User Account
* The users must login with Oauth2
* The Two Factor Authentication (TFA) must be implemented
* The users can add each other as friends on the website
### Chat
* A real-time chat must be implemented
* Some features are mandatory, such as: having different type of channel (private, public and protected by password), setting a user as channel's owner, setting some users as channel's administrators
### Game
* Users can invite others to play pong in the chat and elsewhere
* There must be a matchmaking system
* One can watch the two players playing pong live without interfering it
* the game must be responsive

## How to run
* Clone the project
* Get your 'UID' and 'SECRET' with 42 API and write them in the backend '.env' file in the dedicated spaces
* Configure your 42 API redirect URL to redirect to:
```
http://[local_server_ip_address]:3000/api/auth/42/redirect/
```
* change 'localhost' to [local_server_ip_address] in backend '.env', in frontend 'environments' folder
* You need to have Docker installed to run the project
* At the root of the project run:
```shell
docker-compose up --build
```