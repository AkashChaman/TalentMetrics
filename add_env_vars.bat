@echo off
REM Add Firebase Admin SDK credentials to Vercel

echo Adding FIREBASE_PROJECT_ID...
echo talentmetrics-6a911 | vercel env add FIREBASE_PROJECT_ID --yes

echo Adding FIREBASE_PRIVATE_KEY_ID...
echo 64c442871d179419e01f8f983b9271ea2635ba28 | vercel env add FIREBASE_PRIVATE_KEY_ID --yes

echo Adding FIREBASE_CLIENT_EMAIL...
echo firebase-adminsdk-fbsvc@talentmetrics-6a911.iam.gserviceaccount.com | vercel env add FIREBASE_CLIENT_EMAIL --yes

echo Adding FIREBASE_CLIENT_ID...
echo 112387603448176829804 | vercel env add FIREBASE_CLIENT_ID --yes

echo Adding FIREBASE_DATABASE_URL...
echo https://your-project-id-default-rtdb.firebaseio.com | vercel env add FIREBASE_DATABASE_URL --yes

echo All credentials added!
