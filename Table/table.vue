
<template>
  <table cellspacing="0" cellpadding="0" border="0" :width="opts.width">
    <thead>
      <tr>
        <template v-for="(cellOpt, headIndex) in columns">
          <th :key="headIndex" v-if="cellOpt.renderHeader">
            <Cell :index="headIndex" :render="cellOpt.renderHeader" />
          </th>
          <th :key="headIndex" v-text="cellOpt.title" v-else />
        </template>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in data" :key="rowIndex">
        <template v-for="(cellOpt, cellIndex) in columns">
          <td :key="rowIndex+'-'+cellIndex" :width="cellOpt.width" :style="cellOpt.style" :align="cellOpt.align" v-if="cellOpt.render">
            <Cell :row="row" :index="rowIndex+'-'+cellIndex" :render="cellOpt.render" />
          </td>
          <td :key="rowIndex+'-'+cellIndex" :width="cellOpt.width" :style="cellOpt.style" :align="cellOpt.align" v-text="cellOpt.formatter ? cellOpt.formatter(row[cellOpt.key]) : row[cellOpt.key] || opts.placeholder" v-else />
        </template>
      </tr >
    </tbody>
  </table>
</template>

<script>
const Cell = {
  name: 'Cell',
  functional: true,
  props: {
    row: Object,
    render: Function,
    index: String,
    columns: { type: Object, default: null }
  },
  render: (h, ctx) => {
    if (!ctx.props.row) return ctx.props.render(h)
    const params = { row: ctx.props.row, index: ctx.props.index }
    if (ctx.props.columns) params.columns = ctx.props.columns
    return ctx.props.render(h, params)
  }
}
export default {
  name: 'CellList',
  components: { Cell },
  props: {
    opts: {
      type: Object,
      default () {
        return {
          width: '100%',
          placeholder: '- -'
        }
      }
    },
    data: {
      type: Array,
      default () {
        return []
      }
    },
    columns: {
      type: Array,
      default () {
        return []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
table {
  table-layout:fixed;
}
tbody > tr {
  transition-property: background-color;
  transition-duration: 0.2s;
  &:hover {
    background-color: #eaeaea;
  }
  &:hover td {
    background: none;
  }
}
th, td {
  min-width: 0;
  box-sizing: border-box;
  word-wrap: break-word;
  word-break: normal;
  white-space: pre-wrap;
  overflow: hidden;
  vertical-align: middle;
  line-height: 22px;
  padding: 0 10px;
  background-color: rgba(255, 255, 255, 1);
  border-bottom: 1px solid rgba(229,231,235,1);
  text-align: left;
}
td {
  font-size: 16px;
  font-weight: 600;
  color: rgba(39, 51, 90, 1);
}
th {
  font-size: 14px;
  font-weight: 500;
  color:rgba(125,137,155,1);
  font-weight:400;
}
</style>
