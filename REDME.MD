# Clicker Project

## Description: 

Clicker is an app that you can have on your server, it offers admin panel with full CRUD capacity. Users are able to log into their acounts and play a simple but fun clicker game.

## Functionalities:
for user: earning points, login and register
for admin: Full admin panel with ability to create new user, read user data(passwords hidden for user privacy, but can be changed), updating user data ane deleting users.

## How to get started: 

### What you need: 

Docker - preferably Docker Desktop 

Git - optional

Some kind of IDE like vsc

### How to run:

Create new folder and open Bash in this directory and type:

    git clone https://github.com/Squrelli/J229.git

Wait for files to download and type:

    docker-compose up -d

If all done corectly, open browser and go to https://localhost:3003, 

### Login Data:

#### Login: admin

#### Password: admin

Change login and password before deploying app to public.

### How to stop the app

    docker-compose down


### Errors and fixes

#### Port 3003 is occupied

Simply change the port variable in docker-compose.yml

#### Docker doesnt work

Check if u have installed docker by using

    docker --version
    docker-compose --version

#### You dont have git

Download repository in zip file from github.com/Squrelli/J299, unpack in desire directory ale continue as normal.

#### If you dont have docker

Download node.js, MongoDB and the code 

Install dependencies

    npm install

Start MongoDb localy 

Run your app

    npm start


## Endpoints:

### No authentication required

GET	/	Home page

GET	/login	Login form

GET	/faq	FAQ page

GET    /registerForm   Display registration form

POST	/login	User authentication

POST	/register	Register user with provided data


### Authentication required

GET	/logout	User logout

GET	/profile	Current user's profile

GET	/users	List all users

GET	/add	Add new user form

GET	/users/:identifier	Get user by ID or username

GET	/users/:id/edit	Edit user form

POST	/users/:id/update	Update user data

POST	/users/:id/delete	Delete user

POST	/users/:id/add-point	Add point to user

POST	/addToDB	Add user to database

## Used technology

Node.js

express

ejs

bcrypt

mongodb

docker

## Authors 

Marek Sztuk

## Licence

[MIT](https://choosealicense.com/licenses/mit/)

MIT License

Copyright (c) [2025] [Marek Sztuk]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
