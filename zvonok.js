import express from 'express';
import sassMiddleware from 'node-sass-middleware';
import Sound from 'node-aplay';
import say from 'say';
import multer from 'multer';
import i18next from 'i18next';
import Backend from 'i18next-node-fs-backend';
import {i18nextMiddleware, LanguageDetector, handle} from 'i18next-express-middleware';
import config from './config.json';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const app = express();

i18next
  .use(LanguageDetector)
  .use(Backend)
  .init({
    nsSeparator: false,
    keySeparator: false,
    fallbackLng: false,
    ignoreRoutes: ['doorbell', 'style.css', 'main.js'],
    backend: {
      loadPath: './locales/{{lng}}.json'
    },
    detection: {
      caches: ['cookie']
    }
  });

app.set('view engine', 'jade');
app.set('views', `${__dirname}/frontend/views`);

app.use(handle(i18next));
app.use(sassMiddleware({
  src: `${__dirname}/frontend/scss`,
  outputStyle: 'compressed',
  includePaths: [
    'node_modules/bootstrap/scss'
  ]
}));

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/style.css', (req, res) => {
  res.sendFile(`${__dirname}/frontend/scss/style.css`);
});

app.get('/main.js', (req, res) => {
  res.sendFile(`${__dirname}/frontend/js/main.js`);
});

app.post('/doorbell', upload.single(), (req, res) => {
  let repeat = config.repeatCount || 1;
  let i = 1;
  let play = function() {
    let sound = new Sound(`${__dirname}/audio/doorbell.wav`);
    sound.on('complete', () => {
      if (req.body.text && req.body.text != '') {
        say.speak(null, req.body.text, () => {
          if (i < repeat) {
            play();
            i++;
          }
        });
      } else if (i < repeat) {
        play();
        i++;
      }
    });
    sound.play();
  };

  play();

  if (req.body.redirect && req.body.redirect == 'false') {
    res.sendStatus(200);
  } else {
    res.redirect('/');
  }
});

app.listen(config.port, config.host, () => {
  console.log(`Running on ${config.host}:${config.port}`);
});
