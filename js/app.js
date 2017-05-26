const mashable = 'http://mashable.com/stories.json'
const reddit = 'https://www.reddit.com/top.json'
const digg = 'http://digg.com/api/news/popular.json'
const buzz = 'https://www.buzzfeed.com/tech.xml'
const ladbible = 'https://newsapi.org/v1/articles?source=the-lad-bible&sortBy=top&apiKey=5d6f2f0be20c453aad6143b4bce21b81'
const wtf = 'http://thedailywtf.com/api/articles/recent/10'

const app = document.querySelector('#app')
let mysteryNumber = 0

const state = {
  // source: 'mashable',
  source: ['mashable', 'digg', 'wtf'],
  articles: [{
    image: '',
    title: '',
    theme: '',
    impressions: '',
    summary: '',
    link: '',
    time: 0,
  }],
  popupHidden: false,
  loader: false,
  searchExpanded: false,
}

function fetchUrl(url) {
  return fetch(`https://accesscontrolalloworiginall.herokuapp.com/${url}`)
    .catch(err => {
      console.log('Error: ', err)
      window.alert('Feed not available. Try another one.')
    })
}

function fetchMashableArticles() {
  return fetchUrl(mashable)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      return data.new.map(article => {
        return {
          image: article.feature_image,
          title: article.display_title,
          theme: article.channel,
          impressions: article.formatted_shares,
          summary: article.excerpt,
          link: article.short_url,
          time: article.post_date
//"2017-05-21T04:43:36+00:00"
        }
      })
    })
    .catch(err => {
      console.log('Error: ', err)
      window.alert('Feed corrupted. Try another one.')
    })
}

function fetchDiggArticles() {
  return fetchUrl(digg)
    .then(res => res.json())
    .then(data => {
      console.log('buzz', data)
      return data.data.feed.map(article => {
        return {
          image: article.content.media.images[3].url,
          title: article.content.title,
          theme: article.content.tags[0].display_name,
          impressions: article.digg_score,
          summary: article.content.description,
          link: article.content.url,
          time: article.date_published
//date_published; 1495208160
        }
      })
    })
    .catch(err => {
      console.log('Error: ', err)
      window.alert('Feed corrupted. Try another one.')
    })
}
function fetchWTFArticles() {
  return fetchUrl(wtf)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      return data.map(article => {
        return {
          image: './images/wtf-logo.png',
          title: article.RssTitle,
          theme: article.Series.Title,
          impressions: article.CachedCommentCount,
          summary: article.SummaryHtml,
          link: article.Url,
          time: article.PublishedDate
        //PublishedDate:"/Date(1495188000000)/"
        }
      })
    })
    .catch(err => {
      console.log('Error: ', err)
      window.alert('Feed corrupted. Try another one.')
    })
}

function fetchArticles(source) {
  if (source === 'mashable') {
    return fetchMashableArticles()
  // } else if (source === 'ladbible') {
  //   return fetchLadArticles()
  } else if (source === 'wtf') {
    return fetchWTFArticles()
  } else if (source === 'digg') {
    return fetchDiggArticles()
  }
}

//Original mashable default
// fetchArticles(state.source)
//   .then(articles => {
//     state.articles = articles
//     state.popupHidden = true
//   })
//   .then(() => console.log(state))
//   .then(() => render(app, state))
//   .catch(err => {
//     console.log(err)
//     window.alert('Feed not available. Try another one.')
//   })

// Merge all feeds into one main feed in chronological order for the initial
//    view. When the user clicks/taps the "Feedr" logo at the top, they should be
//    return to this feed. This will be the new "home view."

state.source.forEach(feed => {
  fetchArticles(feed)
    .then(articles => {
      state.articles.push(articles)
      //       let myNewArray = state.articles.reduce(function(prev, curr) {
      //   return prev.concat(curr);
      // });
      state.articles = [].concat(...state.articles)
      state.popupHidden = true
    })
    .then(() => console.log(state))
    .then(() => render(app, state))
    .catch(err => {
      console.log(err)
      window.alert('Feed not available. Try another one.')
    })
})
// state.megaMerge = state.articles[1].concat(state.articles[2], state.articles[3])
function renderArticles(articles) {
  return articles.map(article => `
    <article class="article">
      <section class="featuredImage">
        <img src="${article.image}" alt="" />
      </section>
      <section class="articleContent">
          <a href="${article.link}"><h3>${article.title}</h3></a>
          <h6>${article.theme}</h6>
      </section>
      <section class="impressions">
        ${article.impressions}
      </section>
      <div class="clearfix"></div>
    </article>
  `).join('\n')
}

function render(container, data) {
  container.innerHTML = `
  <header>
    <section class="container">
      <a href="#"><h1>Feedr</h1></a>
      <nav>
        <ul>
          <li><a href="#">News Source: <span>Source Name</span></a>
            <ul id="source">
                <li><a href="#">Mashable</a></li>
                <li><a href="#">Digg</a></li>
                <li><a href="#">WTF</a></li>
            </ul>
          </li>
        </ul>
        <section id="search" class="${state.searchExpanded ? 'active' : ''}">
          <input type="text" name="name" value="">
          <a href="#"><img src="images/search.png" alt="" /></a>
        </section>
      </nav>
      <div class="clearfix"></div>
    </section>
  </header>
  <div id="popUp" class="${state.loader ? 'loader' : ''} ${state.popupHidden ? 'hidden' : ''}">
    <a href="#" class="closePopUp">X</a>
    <div class="container">
      <h1>${state.articles[mysteryNumber].title}</h1>
      <p>
        ${state.articles[mysteryNumber].summary}
      </p>
      <a href="${state.articles[mysteryNumber].link}" class="popUpAction" target="_blank">Read more from source</a>
    </div>
  </div>
  <section id="main" class="container">
    ${renderArticles(data.articles)}
  </section>
  `
}

//When the user selects an article's title show the `#popUp` overlay
delegate('#app', 'click', '.articleContent a', event => {
  event.preventDefault()
  //find right article
  const articleTitle = event.target.innerText
  state.articles.forEach(element => {
    if (element.title === articleTitle) {
      mysteryNumber = state.articles.indexOf(element)
    }
  })
  //console.log(mysteryNumber)  //title
  state.loader = false
  state.popupHidden = false
  render(app, state)
  //TODO fix css so popup shows in window
})

//Add functionality to hide the pop-up when user selects the "X" button on the pop-up.
delegate('#app', 'click', 'a.closePopUp', event => {
  event.preventDefault()
  state.popupHidden = true
  render(app, state)
})

//Clicking/tapping the "Feedr" logo will display the main/default feed.
delegate('#app', 'click', 'section.container h1', event => {
  event.preventDefault()
  state.popupHidden = false
  state.loader = true
  render(app, state)
  state.source = ['mashable', 'digg', 'wtf'] //Why is this necessary??
  state.articles = []
  //WET
  state.source.forEach(feed => {
    fetchArticles(feed)
      .then(articles => {
        state.articles.push(articles)
        state.articles = [].concat(...state.articles)
        state.popupHidden = true
      })
      .then(() => console.log(state))
      .then(() => render(app, state))
      .catch(err => {
        console.log(err)
        window.alert('Feed not available. Try another one.')
      })
  })
})

// When the user selects a source from the dropdown menu on the header, replace
//   the content of the page with articles from the newly selected source. Display
//   the loading pop up when the user first selects the new source, and hide it on
//   success
delegate('#app', 'click', '#source li', event => {
  event.preventDefault()
  console.log(event)
  state.source = event.target.innerText.toLowerCase()
  state.popupHidden = false
  state.loader = true
  render(app, state)
  fetchArticles(state.source) //WET wrap in fetchAndRender?
    .then(articles => {
      state.articles = articles
      state.popupHidden = true
    })
    .then(() => console.log(state))
    .then(() => render(app, state))
    .catch(err => {
      console.log(err)
      window.alert('Feed not available. Try another one.')
    })
})

// - When the user clicks/taps the search icon, expand the input box. Best approach
//   for this is to toggle the `.active` class for the `#search` container. If the
//   search input box is already expanded tapping the search icon again will close
//   the input.
delegate('#app', 'click', '#search a', event => {
  state.searchExpanded = !state.searchExpanded
  render(app, state)
})
//Pressing the "Enter" key should also close the opened input box.
delegate("#app", 'keydown', '#search input', event => {
  if (event.code === 'Enter') {
    state.searchExpanded = !state.searchExpanded
    render(app, state)
  }
})

//class="loader ${state.loading ? '' : 'hidden'}
//if state.loading call loading function
// <section id="main" class="container">
//   // ${state.loading ? renderLoader() : renderArticles(data.articles)}
// </section>
//time=end of link -date only
// function fetchLadArticles() {
//   return fetchUrl(ladbible)
//     .then(res => res.json())
//     .then(data => {
//       console.log(data)
//       return data.articles.map(article => {
//         return {
//           image: article.urlToImage,
//           title: article.title,
//           theme: 'N/A',
//           impressions: 'N/A',
//           summary: article.description,
//           link: article.url
//         }
//       })
//     })
//     .catch(err => {
//       console.log('Error: ', err)
//       window.alert('Feed corrupted. Try another one.')
//     })
// }
