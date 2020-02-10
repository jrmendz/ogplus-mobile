import { expect, should } from "chai";
import { suite, test } from "mocha-typescript";
import { shallowMount } from "@vue/test-utils";

import HelloWorld from "@/components/HelloWorld.vue";

//NOTE 解決: [ts] 裝飾項目的實驗性支援這項功能可能在未來版本中變更。設定 "experimentalDecorators" 選項可移除此警告。
// 1. 選擇檔案 => 喜好設定 => 設定 (File => Preferences => Settings)，打開使用者設定
// 2. 在 json 檔中加入 "javascript.implicitProjectConfig.experimentalDecorators": true

@suite class ExampleTest
{
    @test "should HelloWorld.vue renders props.msg when passed"() {
        const msg = "new message";
        const wrapper = shallowMount(HelloWorld, {
            propsData: { msg },
        });
        expect(wrapper.text()).to.include(msg);
    }
}
