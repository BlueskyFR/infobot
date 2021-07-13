const { Client, MessageEmbed, Permissions } = require("discord.js");
const configFile = require("./config.json");
const { prefix, token } = configFile;

const bot = new Client();

bot.on("ready", () => {
  bot.user.setActivity("les Info1 | !help", { type: "WATCHING" });
  console.log(`Logged in as ${bot.user.tag}`);
});

bot.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  if (!command) return;

  switch (command) {
    case "role":
      setRole(message, args);
      break;

    case "timemachine":
      timeMachine(message);
      break;

    case "removegroups":
      removeGroups(message);
      break;
  }
});

bot.on("guildMemberAdd", (member) => {
  member.createDM().then((DMChannel) => {
    let welcomeMsg = "Salut, et bienvenue sur le serveur **INTER-INFO ANNECY** !\n\n";
    welcomeMsg += "N'oublie pas de consulter le salon #bienvenue et de t'attribuer tes rôles !\n";
    welcomeMsg +=
      "Par exemple, si tu es en Info1 et dans le groupe A, tapes `!role info1 a` dans le salon #bienvenue.\n";
    welcomeMsg += "Tu peux également consulter la liste des rôles disponibles avec `!role`.\n";
    welcomeMsg += "Pour toute question, n'hésite pas à poser une question @Administrateur.\n\n";
    welcomeMsg += "Encore bienvenue de la part de tous les Info :wink: !";

    DMChannel.send(welcomeMsg);
  });
});

// syntax: { command: role(s) }
const roleList = {
  info1: ["INFO 1", "Promo 2020-2022"],
  info2: ["INFO 2", "Promo 2019-2021"],
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
  "lp-bdd": ["LP-BDD", "Licence Pro"],
};

function setRole(message, args) {
  message.react(message.guild.emojis.cache.find((emoji) => emoji.name === "party_wumpus"));

  if (args.length === 0) {
    // Display role list
    let description = "**Role à taper** : rôle obtenu\n";
    Object.keys(roleList).forEach((role) => (description += `\n**${role}** : ${roleList[role]}`));

    const embed = new MessageEmbed()
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
        if (message.member.roles.cache.some((r) => r.name == role)) {
          message.member.roles.remove(message.guild.roles.cache.find((r) => r.name === role));
          message.channel.send(`❌ ${message.author} le rôle \`${role}\` t'a été retiré !`);
        } else {
          message.member.roles.add(message.guild.roles.cache.find((r) => r.name === role));
          message.channel.send(`✅ ${message.author} le rôle \`${role}\` t'a été ajouté !`);
        }
      }
    }
  }
}

const roleCycle = ["INFO 0", "INFO 1", "INFO 2", "INFO +"];

async function timeMachine(message) {
  const guild = message.guild;

  const roleMappings = {};
  for (let role of roleCycle) roleMappings[role] = guild.roles.cache.find((r) => r.name == role);

  let members = (await guild.members.fetch()).array();

  let isAdmin = message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR);

  if (!isAdmin) {
    // Permission error
    message.channel.send(`❌ ${message.author} T'a pas le droit frer. Vil gredin D:<`);

    return;
  }

  const emoji = guild.emojis.cache.find((e) => e.name === "party_wumpus");
  let msg = message.channel.send(`${emoji} Attache ta ceinture Marty Z'EST PARTIIII !!!`);

  let count = 0;

  for (let member of members) {
    for (let role of member.roles.cache.array()) {
      let index = roleCycle.indexOf(role.name);

      // If the role is in the cycle and is not the last one
      if (index != -1 && index < roleCycle.length - 1) {
        count++;
        // Update role
        let nextRole = roleCycle[index + 1];

        member.roles.remove(role);
        member.roles.add(roleMappings[nextRole]);
      }
    }
  }

  (await msg).edit(`✅ **${count}** rôle(s) ont été mis à jour !`);
}

const rolesToRemove = [
  "G21",
  "G22",
  "G23",
  "G24",
  "G25",
  "Groupe A",
  "Groupe B",
  "Groupe C",
  "Groupe D",
];

async function removeGroups(message) {
  let isAdmin = message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR);

  if (!isAdmin) {
    // Permission error
    message.channel.send(`❌ ${message.author} T'a pas le droit frer. Vil gredin D:<`);

    return;
  }

  const guild = message.guild;
  const members = guild.members.cache.array();

  const emoji = guild.emojis.cache.find((e) => e.name === "party_wumpus");
  let msg = message.channel.send(`${emoji} Batch removal in progress...`);

  let count = 0;

  for (let member of members) {
    for (let role of member.roles.cache.array()) {
      if (rolesToRemove.includes(role.name)) {
        count++;
        member.roles.remove(role);
      }
    }
  }

  (await msg).edit(`✅ **${count}** rôle(s) de groupes ont été retirés !`);
}

bot.login(token);
