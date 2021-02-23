const quotes = require('../quotes.json');
module.exports = {
  name: 'mantra',
  description: 'Have Becky tell you her daily mantra. Words to live by!',
  usage: '',
  cooldown: 5,
  args: false,
  serverOnly: false,
  adminOnly: false,
  aliases: ['quote', 'dailyquote', 'dailymantra'],
  
  execute(message, args) {
    const date = new Date();
    const dateHash = (12 * date.getYear() + date.getMonth()) * 31 + date.getDate();

    const index = dateHash % quotes.length;
    let dateString = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}`;
    const numericalDate = date.getDate();

    if (numericalDate > 3 && numericalDate < 21) {
      dateString += 'th';
    } else {
      switch (numericalDate % 10) {
      case 1:dateString += 'st';
        break;
      case 2: dateString += 'nd';
        break;
      case 3: dateString += 'rd';
        break;
      default: dateString += 'th';
      }
    }
    message.channel.send(`My ${dateString} mantra:\n>>> "${quotes[index].quoteText}"\n\t\t\t- ${quotes[index].quoteAuthor}`);
  },
};