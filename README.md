# Expense Manager

The Expo web app uses a Vercel serverless function to communicate with Notion; it no longer calls the Spring backend.

## Configure Notion

In Vercel, add `NOTION_TOKEN`, `NOTION_TRANSACTIONS_DATA_SOURCE_ID`, and `NOTION_DEFAULT_ACCOUNT` in **Project Settings → Environment Variables**. These are server-only values and never reach the browser. The integration needs access only to the Transactions, Categories, Accounts, and Months databases. The property names must match the current schema: `Name`, `Date`, `Amount`, `Type`, `Categories`, `Accounts`, `Months`, and the `Display Categories` rollup.

The Vercel function is the secure production design: do not put `NOTION_TOKEN` in an `EXPO_PUBLIC_*` variable.

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it at Vercel.
2. In Vercel, set the **Framework Preset** to `Other`; `vercel.json` runs the Expo web export.
3. Add the three `NOTION_*` values above for Production, Preview, and Development, then deploy.

Vercel serves the static Expo website and `/api/notion` serverless function together. The Notion token is available only to that function.

## Get started

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
