import StyleDictionary from 'style-dictionary'

// Style Dictionary 설정 객체
const config = {
  // 1. 소스: Tokens Studio에서 내보낸 JSON 파일 경로
  source: ['tokens/**/*.json'],
  log: {
    verbosity: 'verbose' // 에러 난 토큰 이름을 다 보여줌
  },

  // 2. 플랫폼 설정
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: {
            outputReferences: true
          }
        }
      ]
    }
  }
}

// 메인 실행 함수 (v4부터는 비동기로 작동하므로 async/await 필요)
async function build() {
  try {
    // v4 방식: 인스턴스 생성
    const sd = new StyleDictionary(config)

    // 빌드 실행 (await 필수)
    await sd.buildAllPlatforms()

    console.log('\n==============================================')
    console.log('✅  Design Tokens generated successfully!')
    console.log('==============================================\n')
  } catch (error) {
    console.error('\n❌  Error generating tokens:', error)
  }
}

// 실행
build()
