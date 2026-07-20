THIS POC OF ASSIGNMENT FOR INVOICE OPERATOR WHICH WILL HELP OPERATOR TO CREATE AND MANAGE LIST INVOICES

### Features have been done: 
- Login
- View Invoices list (can search INV number, filter by payment status and sort by created date)
- View invoice detail 
- Create simple invoice

### Project structure: 
my-project/
├── node_modules        folder node packages those were imported from package.json
├── android             contain android native config/code base
├── ios                 contain android native config/code base
├── src
│   ├── components      contains commons component
│   ├── config          all the configs in app
│   ├── contexts        react-native context
│   ├── navigation      register/manage screens in app
│   ├── screens         visible screen that implement business flow
│   ├── services        contains downstream api db or service
│   ├── utils           utilities folder that keep helper function
│   └── validation      for form validation
├── package.json        
└── README.md

What i have done in this POC to follow requirement: 
- Securely store sensitive data with in keychain (iOS) and Encrypted Secured Preferences (Android)
- Keep client key / secret away from source code hence perform token login and exchange securely from FE perspective
- Validated input

What i need to improve for this POC technically: 
- Add more testcase
- Exchange token will fire an event that help screen(presenter) and re-fetch api whenever they need
- Standardize and centralize UI system (color, space, typograpy, button, modal, icon, badge,...)
- Centralize label, text and message,... to make it easier to manage and support multi language
- Add more CI strictly to folllow coding standard + quality and support CD

What i need to improve for this POC on business side: 
- User can search invoice not only INV number but also customer, merchant
- Ability to export invoice as PDF and download/share
- Split form to create invoice, user should only keyin section by section instead of lot of text input, spinner,... in a single screen
- Some input that need to user selector instead of text input



# STEP TO RUN APP IN DEVELOPMENT ENV

## Step 0: Install

```sh
yarn
```

copy .env.example to .env and add client key/secret


## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh

# OR using Yarn
yarn ios
```