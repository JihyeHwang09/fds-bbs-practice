import '@babel/polyfill'

import axios from 'axios'
// 로그인 하지 않아도 게시물 읽기는 가능하도록 강사님이 권한을 설정해둠
// 자료 등록, 수정, 삭제는 로그인해야만 가능하게 설정해둠

const api = axios.create({
  // 바깥에서 주입해준  API_URL이라는 환경변수를 사용하는 코드
  // 이 컴퓨터에서만 사용할 환경변수를 설정하기 위해서 .env 파일을 편집하면 된다.
  baseURL: process.env.API_URL
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

const templates = {
  loginForm: document.querySelector('#login-form').content,
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postForm: document.querySelector('#post-form').content,
  postDetail: document.querySelector('#post-detail').content,
  commentItem: document.querySelector('#comment-item').content,
}

const rootEl = document.querySelector('.root')

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

async function drawLoginForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginForm, true)

  // 2. 요소 선택
  const formEl = frag.querySelector('.login-form')

  // 3. 필요한 데이터 불러오기 - 필요없음
  // 4. 내용 채우기 - 필요없음
  // 5. 이벤트 리스너 등록하기
  formEl.addEventListener('submit', async e => {
    e.preventDefault()
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    const res = await api.post('/users/login', {
      username,
      password
    })

    localStorage.setItem('token', res.data.token)
    drawPostList()
  })

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

async function drawPostList() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.postList, true)

  // 2. 요소 선택
  //tbody를 선택한 것임
  const listEl = frag.querySelector('.post-list')

  // 3. 필요한 데이터 불러오기
  // 분해대입
  // const {data}:res.data라는 속성을 미리 꺼내와서 넣을 수 있다.
// data라는 속성에 들어있는 값을 꺼내서 postList 라는 속성에 넣은 것이다.

// const res = await api.get("/posts?_embed=user");
// const plstList = res.data
// 를 1줄로 줄여서 씀
// expand는 부모요소, embed는 자식요소
  const {data: postList} = await api.get('/posts?_expand=user')

  // 4. 내용 채우기
  // 순회할 때 forEach나 for...of 중에 한 가지 쓰면 됨
  for (const postItem of postList) {
    // templates.postItem가져와서 복사하기
    //    <template id="post-item">
    //   <tr class="post-item">
    //     <td class="id"></td>
    //     <td class="title"></td>
    //     <td class="author"></td>
    //   </tr>
    // </template> 가져오는 것임
    const frag = document.importNode(templates.postItem, true)
    const idEl = frag.querySelector('.id')
    const titleEl = frag.querySelector('.title')
    const authorEl = frag.querySelector('.author')

    // 내용 넣어주기
    idEl.textContent = postItem.id
    titleEl.textContent = postItem.title
    authorEl.textContent = postItem.user.username

    // 게시물 제목을 클릭했을 때, drawPostDetail함수가 호출되게 만들기
    titleEl.addEventListener('click', e => {
      drawPostDetail(postItem.id);
    })


    listEl.appendChild(frag);
  }
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 게시물을 그려주는 함수
// 그때그때마다 다른 게시물을 표시해주고 싶기 때문에
// 무슨 게시물이 표시되어야 할지 이 함수 입장에서는 알 수 있는 방법이 없기 때문에
// 이 함수를 실행하는 입장에서 매개변수를 postId로 줘서 만듦

async function drawPostDetail(postId) {
  // 1. 템플릿 복사
  //  <div class="post-detail">
  //    <h2 class="title" />
  //    <p class="author-wrap">
  //      작성자: <span class="author" />
  //    </p>
  //    <p class="body" />
  //  </div>
  const frag = document.importNode(templates.postDetail, true)
  // 2. 요소 선택
  const titleEl = frag.querySelector('.title')
  const authorEl = frag.querySelector('.author')
  const bodyEl = frag.querySelector('.body')
  const backEl = frag.querySelector('.back')
  const commentListEl = frag.querySelector('.comment-list')


  // 3. 필요한 데이터 불러오기
  // data라는 속성을 가지고 있는 객체에서 title, body속성을 가져와서 같은 자리에 저장하는 코드임
  // 분해대입 안에서 또 분해대입을 사용할 수 있음
  // 분해대입은 3중, 4중... 등등 중첩해서 계속 사용가능


    //   <li class="comment-item">
    //   <span class="author"></span>:
    //   <span class="body"></span>
    //   <button class="delete hidden">삭제</button>
    // </li>을 불러와서 comment-list에 넣어줄 것임

    // 이 코드 작성 시점에는 comments가 몇 개 인지 모른다
    // -> comments를 요청해서 응답으로 오는 배열의 길이를 알 수 없다
  const {data: {title, body, user, comments}} = await api.get('/posts/' + postId, {
    params: {
      _expand: 'user',
      _embed: 'comments'


      // _page: 1,
      // _limit: 15
    }
  })
  // 사용자 여러 명의 정보를 불러오고 싶다.
  const params = new URLSearchParams();
  // comments 배열을 순회하면서 params에 id queryString을 붙여준다
  comments.forEach( c => {
    params.append('id', c.userId )
  })
  // userList에는 댓글 작성자만 모여있는 배열이 들어가는 것임(userId들이 들어있는 배열)

  // const res =  await api.get('/users', {
  //   params
  // })
  // const userList = res.data
  // 를 1줄로 줄인 코드

  // userList에는 user들의 정보가 들어있음
  const {data: userList} = await api.get('/users', {
    params
  })

  // 4. 내용 채우기
  titleEl.textContent = title
  bodyEl.textContent = body
  authorEl.textContent = user.username

  // 댓글 표시
  // comments에 서버로부터 응답받은 배열이 들어있음
  for (const commentItem of comments) {
    // 지금 현재 그리고 있는 댓글 데이터가 commentItem에 들어있음
// commentItem.userId에는 작성자 id가 들어있음

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
    const frag = document.importNode(templates.commentItem, true)
// 2. 요소 선택
    const authorEl = frag.querySelector('.author')
    const bodyEl = frag.querySelector('.body')
    const deleteEl = frag.querySelector('.delete')

// 3. 필요한 데이터 불러오기 - 필요 없음(우선 넘어가셨음)

// 4. 내용 채우기
//  "comments": [
//         {
//             "id": 1,
//             "userId": 2,
//             "postId": 1,
//             "body": "도움이 되는 글이네요!"
//         }
//     ]
    bodyEl.textContent = commentItem.body
    // userList가 배열이니까 find메소드 사용가능

    // 댓글 작성자 객체를 찾아서 user라는 변수에 넣어줌
    const user = userList.find(item => item.id === commentItem.userId)
    authorEl.textContent = user.username


// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입
    commentListEl.appendChild(frag)


  }


  // 5. 이벤트 리스너 등록하기
  // 뒤로 가기 버튼 누르면, 게시물 목록을 보여준다.
  backEl.addEventListener('click', e => {
    drawPostList();
  })


  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag);
}

async function drawNewPostForm() {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

async function drawEditPostForm(postId) {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

// 페이지 로드 시 그릴 화면 설정
if (localStorage.getItem('token')) {
  drawPostList()
} else {
  drawLoginForm()
}
