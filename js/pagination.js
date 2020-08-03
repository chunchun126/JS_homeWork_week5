// 分頁元件
Vue.component('pagination', {
    template:
    `<nav aria-label="Page navigation">
        <ul class="pagination pagination-sm justify-content-end mt-5">
            <li class="page-item" :class="{disabled: pages.current_page === 1}">
                <a class="page-link" href="#" aria-label="Previous"
                @click.prevent="getPages(pages.current_page - 1)">
                <span aria-hidden="true">&laquo;</span>
                </a>
            </li>

            <li class="page-item"
                v-for="(page, index) in pages.total_pages" :key="index"
                :class="{active: pages.current_page === page}">
                <a class="page-link" href="#"
                    @click.prevent="getPages(page)">{{ page }}
                </a>
            </li>
            
            <li class="page-item" :class="{disabled: pages.current_page === pages.total_pages}">
                <a class="page-link" href="#" aria-label="Next"
                @click.prevent="getPages(pages.current_page + 1)">
                <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    </nav>`,
    props: {
        pages: {}
    },
    data() {
        return {}
    },
    methods: {
        getPages(page){
            this.$emit('emit-pages', page);
        }
    }
});