import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: resolve => { require(['@/views/login.vue'], resolve); }
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在'
    },
    component: resolve => { require(['@/views/error-page/404.vue'], resolve); }
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error-403',
    component: resolve => { require(['@//views/error-page/403.vue'], resolve); }
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error-500',
    component: resolve => { require(['@/views/error-page/500.vue'], resolve); }
};


export const locking = {
    path: '/locking',
    name: 'locking',
    component: resolve => { require(['@/views/main-components/lockscreen/components/locking-page.vue'], resolve); }
};
// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        { path: 'home', title: {i18n: 'home'}, name: 'home_index', component: resolve => { require(['@/views/home/home.vue'], resolve); } },
        { path: 'ownspaceownspace', title: '个人中心', name: 'ownspace_index', component: resolve => { require(['@/views/own-space/own-space.vue'], resolve); } },
        { path: 'message', title: '消息中心', name: 'message_index', component: resolve => { require(['@/views/message/message.vue'], resolve); } },
        { path: 'userAdd', title: '用户添加', name: 'userAdd', component: resolve => { require(['@/views/myView/user/userAdd.vue'], resolve); } },
        { path: 'userUpdate', title: '用户编辑', name: 'userUpdate', component: resolve => { require(['@/views/myView/user/userUpdate.vue'], resolve); } },
       	{ path: 'roleAdd', title: '角色添加', name: 'roleAdd', component: resolve => { require(['@/views/myView/role/roleAdd.vue'], resolve); } },
        { path: 'roleUpdate', title: '角色修改', name: 'roleUpdate', component: resolve => { require(['@/views/myView/role/roleUpdate.vue'], resolve); } },
        { path: 'rolePermissionList', title: '角色权限', name: 'rolePermissionList', component: resolve => { require(['@/views/myView/role/rolePermissionList.vue'], resolve); } },
        { path: 'hostAdd', title: '添加主机', name: 'hostAdd', component: resolve => { require(['@/views/myView/host/hostadd.vue'], resolve); } },
        { path: 'updatehost', title: '主机设备详情', name: 'updatehost', component: resolve => { require(['@/views/myView/host/updatehost.vue'], resolve); } },
        { path: 'linkAdd', title: '链路添加', name: 'linkAdd', component: resolve => { require(['@/views/myView/link/linkAdd.vue'], resolve); } },
        { path: 'updatelink', title: '链路详情', name: 'updatelink', component: resolve => { require(['@/views/myView/link/updatelink.vue'], resolve); } },
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/userList',
        icon: 'person-stalker',
        title: '用户管理',
        name: 'userList',
        header: 0,
        access: 0,
        component: Main,
        children: [
            { path: 'index', title: '用户管理', name: 'userList_index', access: 0, header: 0, component: resolve => { require(['@/views/myView/user/userList.vue'], resolve); } }
        ]
    },
    {
        path: '/roleList',
        icon: 'android-contacts',
        title: '角色管理',
        name: 'roleList',
        header: 0,
        access: 0,
        component: Main,
        children: [
            { path: 'index', title: '角色管理', name: 'roleList_index', access: 0, header: 0, component: resolve => { require(['@/views/myView/role/roleList.vue'], resolve); } }
        ]
    },
    {
        path: '/systempermissions',
        icon: 'key',
        title: '权限管理',
        name: 'systempermissions',
        header: 0,
        access: 1,
        component: Main,
        children: [
            {
                path: 'InterfacePermissions',
                icon: 'network',
                name: 'InterfacePermissions',
                title: '接口权限',
                component: resolve => { require(['@/views/myView/systempermissions/InterfacePermissions.vue'], resolve); }
            }
        ]
    },
    {
        path: '/hostList',
        icon: 'soup-can',
        title: '主机设备管理',
        name: 'hostList',
        header: 1,
        access: 0,
        component: Main,
        children: [
            { path: 'index', title: '主机设备管理', name: 'hostList_index', access: 0, header: 0, component: resolve => { require(['@/views/myView/host/host.vue'], resolve); } },
        ]
    },
    {
        path: '/linkList',
        icon: 'connection-bars',
        title: '链路管理',
        name: 'linkList',
        header: 1,
        access: 1,
        component: Main,
        children: [
            { path: 'index', title: '链路管理', name: 'linkList_index', access: 0, header: 0, component: resolve => { require(['@/views/myView/link/linklist.vue'], resolve); } },
        ]
    },
    {
        path: '/sentmessage',
        icon: 'ios-email',
        title: '已送消息',
        name: 'sentmessage',
        header: 2,
        access: 0,
        component: Main,
        children: [
            { path: 'index', title: '已送消息', name: 'sentmessage_index', access: 0, header: 0, component: resolve => { require(['@/views/message/sentmessage.vue'], resolve); } },
        ]
    },
    {
        path: '/sendmessage',
        icon: 'ios-compose',
        title: '发送消息',
        name: 'sendmessage',
        header: 2,
        access: 1,
        component: Main,
        children: [
            { path: 'index', title: '发送消息', name: 'sendmessage_index', access: 0, header: 0, component: resolve => { require(['@/views/message/sendmessage.vue'], resolve); } },
        ]
    },
    {
        path: '/messagelist',
        icon: 'chatbubbles',
        title: '消息查看',
        name: 'messagelist',
        header: 2,
        access: 2,
        component: Main,
        children: [
            { path: 'index', title: '消息查看', name: 'messagelist_index', access: 0, header: 0, component: resolve => { require(['@/views/message/message.vue'], resolve); } },
        ]
    },
    {
        path: '/telecontrol',
        icon: 'android-globe',
        title: '远程控制',
        name: 'telecontrol',
        header: 3,
        access: 0,
        component: Main,
        children: [
            { path: 'index', title: '综合控制', name: 'telecontrol_index', access: 0, header: 0, component: resolve => { require(['@/views/myView/host/telecontrol.vue'], resolve); } },
        ]
    },
];


// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    locking,
    ...appRouter,
    page500,
    page403,
    page404
];
