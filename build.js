import StyleDictionary from "style-dictionary";

/**
 * 토큰 객체를 순회(Recursion)하며 데이터를 정제하는 헬퍼 함수
 * 1. $type: 'boxShadow' -> 'shadow' 변경
 * 2. 불필요한 'type' 속성 삭제
 */
function sanitizeTokens(obj) {
  for (const key in obj) {
    const node = obj[key];

    // 객체인 경우에만 탐색 (null 체크 포함)
    if (typeof node === "object" && node !== null) {
      // 1. $type 변경 로직
      if (node.$type === "boxShadow") {
        node.$type = "shadow";
      }

      // 2. 레거시 type 속성 제거
      if ("type" in node) {
        delete node.type;
      }

      // 3. 재귀 호출 (자식 노드 탐색)
      sanitizeTokens(node);
    }
  }
}

// global 제거
// $type: 'boxShadow' -> $type: 'shadow'로 변환
StyleDictionary.registerPreprocessor({
  name: "remove-global",
  preprocessor: (dictionary) => {
    // 1. 구조 분해: global과 나머지(rest) 분리
    const { global, ...rest } = dictionary;

    // 2. 병합: global의 내용을 밖으로 꺼내어 rest와 합침
    // (기존 코드의 의도를 살려 global의 내용이 rest와 동등한 레벨로 올라오도록 병합)
    const mergedDictionary = { ...global, ...rest };

    // 3. 깊은 복사: 원본 객체 보호 및 안전한 변형을 위해 복제
    const finalDictionary = JSON.parse(JSON.stringify(mergedDictionary));

    // 4. 정제 함수 실행: 분리한 함수를 호출하여 전체 토큰을 수정
    sanitizeTokens(finalDictionary);

    return finalDictionary;
  },
});

// variables.css
const config = {
  source: ["tokens/tokens.json"],
  log: {
    verbosity: "verbose",
  },
  platforms: {
    css: {
      preprocessors: ["remove-global"],
      transformGroup: "css",
      transforms: ["name/kebab", "typography/css/shorthand"],
      buildPath: "src/styles/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
};

async function build() {
  try {
    const sd = new StyleDictionary(config);
    await sd.buildAllPlatforms();
    console.log("\n==============================================");
    console.log("✅  Design Tokens generated!");
    console.log("==============================================\n");
  } catch (error) {
    console.error("\n❌  Build failed:", error);
  }
}

build();
