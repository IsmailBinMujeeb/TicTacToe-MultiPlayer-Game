# TicTacToe-MultiPlayer-Game
Welcome to the TicTacToe Multiplayer Game! This application allows multiple players to engage in the classic TicTacToe game in real-time.

![wakatime](https://wakatime.com/badge/user/762eb31e-429a-48a8-a9ba-9fc3e5f7aeea/project/46264392-9758-4174-8a72-4ad8e5133fa8.svg?style=plastic)

## Features
- Real-Time Multiplayer: Play TicTacToe with friends or other players in real-time.
- User Authentication: Secure login and registration system to keep track of player statistics.
- Interactive UI: A user-friendly interface that enhances the gaming experience.
## Technologies Used
- [![EJS](https://img.shields.io/badge/EJS-2B2E3A?logo=EJS&logoColor=fff)](#) [![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=fff)](#) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
- [![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white)](#) [![Express.js](https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB)](#)
- [![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?logo=mongodb&logoColor=white)](#) [![Redis](https://img.shields.io/badge/Redis-%23DD0031.svg?logo=redis&logoColor=white)](#)
- [![Socket.io](https://img.shields.io/badge/Socket.io-3C3C3D?logo=Socket.io&logoColor=white)](#)

## Installation [![GitHub](https://img.shields.io/badge/-%23121011.svg?logo=github&logoColor=white)](#installation) [![Docker](https://img.shields.io/badge/-2496ED?logo=docker&logoColor=fff)](#docker-deployment)
To set up the project locally, follow these steps:

1. Clone the Repository:

```bash
git clone https://github.com/IsmailBinMujeeb/TicTacToe-MultiPlayer-Game.git
cd TicTacToe-MultiPlayer-Game
```
2. Install Dependencies: Ensure you have Node.js and npm installed. Then, run:
```bash
npm install
```
3. Set Up Environment Variables:

- Duplicate the .example.env file and rename the copy to .env.
```bash
cp .example.env .env
```
- Open the .env file and configure the following variables:
```env
PORT=3000
SESSION_SECRET=
GOOGLE_CALLBACK_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
DB_CONN_STR=
REDIS_URL=
```
4. Start the Application:
```bash
npm start
```
**The server will start, and you can access the application at http://localhost:3000.**

## Docker Deployment
For those who prefer using Docker:\
[Docker Image](https://hub.docker.com/r/ismailbinmujeeb/tic-tac-toe)
1. Build the Docker Image:

```bash
docker build -t tictactoe-multiplayer-game .
```

2. Run the Docker Container:
```bash
docker run -d -p 3000:3000 --name tictactoe-game tictactoe-multiplayer-game
```

3. Or pull the image

```bash
docker pull ismailbinmujeeb/tic-tac-toe
```

**The application will be available at http://localhost:3000.**

### Alternatively, you can use Docker Compose:

1. Start Services:
```bash
docker-compose up -d
```
This will set up the application along with any dependencies defined in the docker-compose.yml file.

## Contributing
We welcome contributions! If you'd like to contribute:

1. Fork the repository.

2. Create a new branch (git checkout -b feature/YourFeature).

3. Commit your changes (git commit -m 'Add YourFeature').

4. Push to the branch (git push origin feature/YourFeature).

5. Open a Pull Request.

**Please ensure your code adheres to the project's coding standards and includes appropriate tests.**
