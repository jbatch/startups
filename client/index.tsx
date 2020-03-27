import React from 'react';
// @ts-ignore react-dom types seem to be super buggy, not importing them
import ReactDom from 'react-dom';
import StartScreen from './views/StartScreen';

ReactDom.render(<StartScreen></StartScreen>, document.getElementById('root'));
