# ft_transcendence_final

## Objective
* This project is to create a website that allows users to play the pong game against each other and to chat
## Credits
* This project is done by 3 students of school 42: Vlageard, Tvanbesi & Hzhou

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

## A glance of the result
- loggin interface
![1663627946788](https://user-images.githubusercontent.com/43440213/191134455-33b1a975-f51f-4c4c-821f-5d5aa2d7b676.jpg)
- the pong game playing
![1663628281930](https://user-images.githubusercontent.com/43440213/191134528-37cdcded-64e0-4ab5-a9f3-a93c57b1493f.jpg)
- score showing
![1663628306357](https://user-images.githubusercontent.com/43440213/191134560-134d2685-f70c-4d43-aaf2-0a7e93fb0084.jpg)
- the profile page
![1663628329910](https://user-images.githubusercontent.com/43440213/191134585-330600ae-9b2f-4a0b-9f6c-65ba635ba4e2.jpg)
- conversation between normal user and owner of the channel
![1663628441982](https://user-images.githubusercontent.com/43440213/191134601-fcdcc131-dd9b-4256-872d-2f818689e8a3.jpg)
- setting page
![1663628517236](https://user-images.githubusercontent.com/43440213/191134667-afea2379-e5ba-4acc-9254-379458d2e85b.jpg)
