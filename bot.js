const Discord = require("discord.js");
const configFile = require("./config.json");
const { prefix, token } = configFile;

const bot = new Discord.Client();

bot.on("ready", () => {
  bot.user.setActivity("les Info1 | !help", { type: "WATCHING" });
  console.log(`Logged in as ${bot.user.tag}`);
});

bot.on("message", message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  if (!command) return;

  switch (command) {
    case "role":
      setRole(message, args);
      break;
  }
});

bot.on("guildMemberAdd", member => {
  member.createDM().then(DMChannel => {
    let welcomeMsg =
      "Salut, et bienvenue sur le serveur **INTER-INFO ANNECY** !\n\n";
    welcomeMsg +=
      "N'oublie pas de consulter le salon #bienvenue et de t'attribuer tes rôles !\n";
    welcomeMsg +=
      "Par exemple, si tu es en Info1 et dans le groupe A, tapes `!role info1 a` dans le salon #bienvenue.\n";
    welcomeMsg +=
      "Tu peux également consulter la liste des rôles disponibles avec `!role`.\n";
    welcomeMsg +=
      "Pour toute question, n'hésite pas à poser une question @Administrateur.\n\n";
    welcomeMsg += "Encore bienvenue de la part de tous les Info :wink: !";

    DMChannel.send(welcomeMsg);
  });
});

// syntax: { command: role(s) }
const roleList = {
  info1: ["INFO 1", "Promo 2019-2021"],
  info2: ["INFO 2", "Promo 2018-2020"],
  "info+": "INFO +",

  a: "Groupe A",
  b: "Groupe B",
  c: "Groupe C",
  d: "Groupe D",
  g21: "G21",
  g22: "G22",
  g23: "G23",
  g24: "G24",
  g25: "G25",

  "lp-dim": ["LP-DIM", "Licence Pro"],
  "lp-cpinfo": ["LP-CPINFO", "Licence Pro"],
  "lp-bdd": ["LP-BDD", "Licence Pro"]
};

function setRole(message, args) {
  message.react(
    message.guild.emojis.find(emoji => emoji.name === "party_wumpus")
  );

  if (args.length === 0) {
    // Display role list
    let description = "**Role à taper** : rôle obtenu\n";
    Object.keys(roleList).forEach(
      role => (description += `\n**${role}** : ${roleList[role]}`)
    );

    const embed = new Discord.RichEmbed()
      .setColor([255, 0, 0])
      .setTitle("Liste des rôles autorisés :")
      .setAuthor("Rôles", message.client.user.displayAvatarURL)
      .setTimestamp()
      .setDescription(description)
      .setFooter(
        "N'hésitez pas à demander de l'aide si besoin ! Toute suggestion est la bienvenue."
      );

    message.channel.send(embed);
    return;
  }

  for (let roleAlias of args) {
    roleAlias = roleAlias.toLowerCase();
    if (roleAlias in roleList) {
      let roles = roleList[roleAlias];
      if (!(roles instanceof Array)) {
        roles = [roles];
      }

      for (let role of roles) {
        if (message.member.roles.some(r => r.name == role)) {
          message.member.removeRole(
            message.guild.roles.find(r => r.name === role)
          );
          message.channel.send(
            `❌ ${message.author} le rôle \`${role}\` t'a été retiré !`
          );
        } else {
          message.member.addRole(
            message.guild.roles.find(r => r.name === role)
          );
          message.channel.send(
            `✅ ${message.author} le rôle \`${role}\` t'a été ajouté !`
          );
        }
      }
    }
  }
}

bot.login(token);
