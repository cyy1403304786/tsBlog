module.exports = {
    title: 'TypeScript 相关介绍',
    description: '',
    base: '/', // 这是部署到github相关的配置
    markdown: {
      lineNumbers: false // 代码块显示行号
    },
    themeConfig: {
        nav:[ // 导航栏配置
            { text: 'Home', link: '/' },
            { text: '博客', link: '/blog/' },
            { text: '个人门户', link: '/' }
        ],
        sidebar: {
            '/blog/': [
              ['', '前言及目录'],
              ['Knowing', '一、去了解 TypeScript'],
              ['TypeSystem', '二、TypeScript 的类型系统'],
            ],
        },
        sidebarDepth: 3, // 侧边栏显示2级
        lastUpdated: '最后更新',
    },


}