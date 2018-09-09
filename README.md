# Screeps scripts
These are the scripts for my [screeps](https://screeps.com).
<br><br>

## Requirements
- [Node + npm](https://nodejs.org)
- [Grunt](https://gruntjs.com/getting-started)

## Setup
Copy the Gruntfile example
```bash
npm install
cp example.Gruntfile.js Gruntfile.js
```

Change the placeholders inside it 

```javascript
...
      options: {
        email: 'enter_email', // this
        password: 'enter_password', // this
        branch: 'choose_branch', // and this
        ptr: false
      },
...
```

## Deployment
To deploy the script to screeps run:
```bash
grunt screeps
```
Which will deploy the code that is inside `dist` folder to the specified branch of the specified account.