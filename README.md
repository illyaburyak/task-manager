# Task-manager

Task manager is the application where user can create an account and add some tasks that needs to be completed. Users
can log in and modify their tasks or delete them. Users can see only their tasks and not others. To Store user's
information I used MongoDB with Mongoose, and JWT in order to secure password. For routing and middleware I used
Express.js.

Users are able to search their tasks, sort tasks by date created, and also I provided pagination for convenience

Users can upload profile picture for their accounts to the server and access it when they need to

All rest end points fully covered in Jest tests

## Usage

```

# start app in prod
npm start

# start app in dev mode
npm run dev

# start app in test mode
npm test
```