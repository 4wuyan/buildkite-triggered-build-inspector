async function getTriggeredBuildsUrlList(url) {
  return fetch(`${url}.json`).then(r => r.json())
    .then(j => j.jobs.filter(e => e.type === "trigger").map(e => e.triggered_build.url));
};

async function queryBuild(url, listItem) {
  fetch(`${url}.json`).then(r => r.json()).then(buildInfo => {
    if (buildInfo.state !== "passed") {
      NotPassedUrlList.push(url)
    }
    let emoji
    switch (buildInfo.state) {
      case "passed":
        emoji = "💚"; break;
      case "started":
      case "scheduled":
        emoji = "💛"; break;
      case "blocked":
        emoji = "🟩"; break;
      case "canceled":
      case "failed":
        emoji = "💔"; break;
      default:
        emoji = "❔"
    }
    listItem.appendChild(document.createTextNode(`${emoji} `))
    const a = document.createElement('a')
    a.href = url
    a.appendChild(document.createTextNode(buildInfo.message))
    listItem.appendChild(a)
    listItem.appendChild(document.createTextNode(` ${buildInfo.state}`))
  })
};

document.addEventListener('click', e => {
  if(e.target.href !== undefined){
    chrome.tabs.create({url: e.target.href, active: false})
  }
});

var allTriggeredBuildsUrlList = []
var NotPassedUrlList = []
document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    const url = new URL(tabs[0].url)
    if (url.hostname === "buildkite.com") {
      getTriggeredBuildsUrlList(url.origin + url.pathname)
        .then(urlList => {allTriggeredBuildsUrlList = urlList; urlList.forEach(u => {
          const item = document.createElement("li");
          document.getElementById("triggers").appendChild(item);
          queryBuild(u, item)
        })})
    }
  });

  document.getElementById('button_not_passed').addEventListener('click', () => {
    NotPassedUrlList.forEach(u => chrome.tabs.create({url: u, active: false}))
  });

  document.getElementById('button_all').addEventListener('click', () => {
    allTriggeredBuildsUrlList.forEach(u => chrome.tabs.create({url: u, active: false}))
  });
});
